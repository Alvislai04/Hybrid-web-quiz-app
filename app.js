// 1. Import dependencies:
const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const QRCode = require('qrcode');

// 2. Initialize the App
const app = express();

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'quiz',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');
  connection.release();
});

const sessionStore = new MySQLStore({}, pool);

// 3. Set Up Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use(session({
  secret: 'secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 8 * 60 * 1000,
    secure: false,
    httpOnly: true,
    sameSite: 'strict'
  },
  rolling: true
}));

app.use((req, res, next) => {
  if (req.path === '/' ||
    req.path === '/login' ||
    req.path === '/register' ||
    req.path.startsWith('/public/') ||
    req.path === '/logout') {
    return next();
  }

  if (!req.session.user) {
    return res.redirect('/?sessionExpired=true');
  }

  const now = Date.now();
  const lastActive = req.session.user.lastActivity || now;
  const inactiveTime = now - lastActive;

  if (inactiveTime > 8 * 60 * 1000) {
    req.session.destroy(() => {
      return res.redirect('/?sessionExpired=true');
    });
    return;
  }

  req.session.user.lastActivity = now;

  req.session.touch();

  next();
});

// 4. Set Up View Engine:
app.set("view engine", "pug");

async function generateUniqueUserId() {
  let id = '';
  let isUnique = false;

  while (!isUnique) {
    const num = Math.floor(10000 + Math.random() * 90000);
    id = `U${num}`;
    const [result] = await pool.query('SELECT userID FROM users WHERE userID = ?', [id]);
    if (result.length === 0) {
      isUnique = true;
    }
  }

  return id;
}

async function generateUniqueSessionId() {
  let id = '';
  let isUnique = false;

  while (!isUnique) {
    const num = Math.floor(1000 + Math.random() * 9000);
    id = `S${num}`;
    const [result] = await pool.query('SELECT sessionID FROM gameSessions WHERE sessionID = ?', [id]);
    if (result.length === 0) {
      isUnique = true;
    }
  }

  return id;
}

async function generateUniquePartyCode() {
  let code = '';
  let isUnique = false;

  while (!isUnique) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const [result] = await pool.query('SELECT partyCode FROM gameSessions WHERE partyCode = ?', [code]);
    if (result.length === 0) {
      isUnique = true;
    }
  }

  return code;
}

// 5. Define Routes:
app.get("/", function (req, res) {
  const messages = {
    sessionExpired: req.query.sessionExpired === 'true',
    logout: req.query.logout === 'success'
  };
  res.render('reg_log', {
    sessionExpired: req.query.sessionExpired === 'true',
    logoutSuccess: req.query.logout === 'success'
  });
});

app.post('/register', async (req, res) => {
  const { username, playerName, password } = req.body;

  try {
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).render('reg_log', {
        error: 'Username already exists',
        formData: req.body
      });
    }

    // Generate salt and hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(password + salt, 10);
    const userID = await generateUniqueUserId();
    await pool.query('INSERT INTO users (userID, username, password_hash, salt, playerName) VALUES (?, ?, ?, ?, ?)',
      [userID, username, hashedPassword, salt, playerName]);
    req.session.user = {
      id: userID,
      username,
      playerName,
      lastActivity: Date.now()
    };
    res.redirect('/menu');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('reg_log', { error: 'Registration failed', formData: req.body });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).render('reg_log', {
        error: 'Invalid username or password',
        formData: { username }
      });
    }

    const user = users[0];

    // Verify password with salt
    const isValid = await bcrypt.compare(password + user.salt, user.password_hash);

    if (!isValid) {
      return res.status(401).render('reg_log', {
        error: 'Invalid username or password',
        formData: { username }
      });
    }

    req.session.user = {
      id: user.userID,
      username: user.username,
      playerName: user.playerName,
      lastActivity: Date.now()
    };

    res.redirect('/menu');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('reg_log', {
      error: 'Login failed',
      formData: { username }
    });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).redirect('/menu');
    }
    res.redirect('/?logout=success');
  });
});

app.get('/menu', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/?sessionExpired=true');
  }
  res.render('menu', {
    username: req.session.user.username,
    playerName: req.session.user.playerName
  });
});

app.get('/new-game', async (req, res) => {
  if (!req.session.user) return res.redirect('/?sessionExpired=true');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const sessionID = await generateUniqueSessionId();
    const partyCode = await generateUniquePartyCode();
    const hostID = req.session.user.id;
    const playerName = req.session.user.playerName;
    const userID = req.session.user.id;

    await connection.query(
      'INSERT INTO gameSessions (sessionID, partyCode, hostID, isActive, createdTime) VALUES (?, ?, ?, TRUE, NOW())',
      [sessionID, partyCode, hostID]
    );

    await connection.query(
      'INSERT INTO game_players (sessionID, userID, playerName, score) VALUES (?, ?, ?, 0)',
      [sessionID, userID, playerName]
    );

    await connection.commit();
    connection.release();
    res.redirect(`/lobby?partyCode=${partyCode}&isHost=true`);
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('New game error:', err);
    res.redirect('/menu?error=create_game');
  }
});

app.get('/lobby', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/?sessionExpired=true');
  }

  const { partyCode, isHost } = req.query;
  const joinUrl = `${partyCode}`;

  // Generate QR code data URL
  let qrCodeDataUrl = '';
  if (partyCode) {
    qrCodeDataUrl = await QRCode.toDataURL(joinUrl);
  }

  res.render('lobby', {
    partyCode,
    username: req.session.user.username,
    userID: req.session.user.id,
    isHost: isHost === 'true',
    playerName: req.session.user.playerName,
    qrCodeDataUrl
  });
});

app.get('/join-party', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/?sessionExpired=true');
  }
  res.render('joinParty');
});

app.post('/join-game', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/?sessionExpired=true');
  }

  const { partyCode } = req.body;
  const userID = req.session.user.id;
  const playerName = req.session.user.playerName;

  try {
    const [results] = await pool.query(
      'SELECT * FROM gameSessions WHERE partyCode = ? AND isActive = TRUE',
      [partyCode]
    );
    if (results.length === 0) {
      return res.redirect('/menu?error=invalid_code');
    }
    const sessionID = results[0].sessionID;

    const [existing] = await pool.query(
      'SELECT * FROM game_players WHERE sessionID = ? AND userID = ?',
      [sessionID, userID]
    );
    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO game_players (sessionID, userID, playerName, score) VALUES (?, ?, ?, 0)',
        [sessionID, userID, playerName]
      );
    }
    res.redirect(`/lobby?partyCode=${partyCode}&isHost=false`);
  } catch (err) {
    console.error('Join game error:', err);
    res.redirect('/menu?error=join_failed');
  }
});

// Delete party (host only)
app.post('/delete-party', async (req, res) => {
  const { partyCode } = req.body;
  const currentUser = req.session.user;

  try {
    const [sessions] = await pool.query('SELECT sessionID, hostID FROM gameSessions WHERE partyCode = ?', [partyCode]);

    if (sessions.length === 0) {
      return res.redirect('/menu?error=session_not_found');
    }

    const { sessionID, hostID } = sessions[0];

    if (hostID !== currentUser.id) {
      return res.status(403).send("Only the host can delete the game.");
    }

    await pool.query('DELETE FROM game_players WHERE sessionID = ?', [sessionID]);
    await pool.query('DELETE FROM gameSessions WHERE sessionID = ?', [sessionID]);

    res.redirect('/menu');
  } catch (error) {
    console.error('Delete party error:', error);
    res.redirect('/menu?error=delete_failed');
  }
});

app.post('/leave-party', async (req, res) => {
  const { userID, partyCode } = req.body;

  try {
    console.log('Leave request received:', { userID, partyCode });

    const [sessionResult] = await pool.query(
      'SELECT sessionID FROM gameSessions WHERE partyCode = ?',
      [partyCode]
    );

    if (sessionResult.length === 0) {
      console.error("No session found.");
      return res.redirect('/menu?error=session_not_found');
    }

    const sessionID = sessionResult[0].sessionID;

    const [result] = await pool.query(
      'DELETE FROM game_players WHERE userID = ? AND sessionID = ?',
      [userID, sessionID]
    );

    console.log(`Deleted ${result.affectedRows} rows from game_players`);
    res.redirect('/menu');
  } catch (err) {
    console.error("Failed to leave party:", err);
    res.redirect('/menu?error=leave_party');
  }
});

app.get('/check-party', async (req, res) => {
  const { partyCode } = req.query;
  if (!partyCode) return res.json({ exists: false });

  try {
    const [results] = await pool.query('SELECT * FROM gameSessions WHERE partyCode = ?', [partyCode]);
    res.json({ exists: results.length > 0 });
  } catch (err) {
    console.error('Error checking party:', err);
    res.status(500).json({ exists: false });
  }
});

app.get('/start', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/?sessionExpired=true');
  }

  const { partyCode } = req.query;
  const userID = req.session.user.id;
  const playerName = req.session.user.playerName;

  try {
    const [sessions] = await pool.query(
      'SELECT sessionID, hostID, hasStarted FROM gameSessions WHERE partyCode = ? AND isActive = TRUE',
      [partyCode]
    );

    if (sessions.length === 0) {
      return res.redirect('/menu?error=session_not_found');
    }

    const sessionID = sessions[0].sessionID;
    const isHost = sessions[0].hostID === userID;

    if (isHost && !sessions[0].hasStarted) {
      await pool.query(
        'UPDATE gameSessions SET hasStarted = TRUE WHERE sessionID = ?',
        [sessionID]
      );
    }
    else if (!isHost && !sessions[0].hasStarted) {
      return res.render('lobby', {
        partyCode,
        username: req.session.user.username,
        userID: req.session.user.id,
        isHost: false,
        playerName: req.session.user.playerName,
        message: 'Waiting for host to start the game...'
      });
    }

    res.render('gameplay', {
      playerName: playerName,
      partyCode: partyCode || 'UNKNOWN'
    });

  } catch (error) {
    console.error('Start game error:', error);
    res.redirect('/menu?error=start_game');
  }
});

app.post('/start-game', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { partyCode } = req.body;

  try {
    const [sessions] = await pool.query(
      'SELECT sessionID FROM gameSessions WHERE partyCode = ? AND hostID = ?',
      [partyCode, req.session.user.id]
    );

    if (sessions.length === 0) {
      return res.status(403).json({ error: 'Only the host can start the game' });
    }

    await pool.query(
      'UPDATE gameSessions SET hasStarted = TRUE WHERE sessionID = ?',
      [sessions[0].sessionID]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

app.get('/check-game-started', async (req, res) => {
  const { partyCode } = req.query;

  try {
    const [sessions] = await pool.query(
      'SELECT hasStarted FROM gameSessions WHERE partyCode = ?',
      [partyCode]
    );

    if (sessions.length === 0) {
      return res.json({ hasStarted: false });
    }

    res.json({ hasStarted: sessions[0].hasStarted });
  } catch (error) {
    console.error('Error checking game status:', error);
    res.status(500).json({ error: 'Failed to check game status' });
  }
});

app.get('/check-game-ended', async (req, res) => {
  const { partyCode } = req.query;

  if (!partyCode) return res.status(400).json({ gameEnded: false });

  try {
    const [sessionRows] = await pool.query(
      'SELECT isActive FROM gameSessions WHERE partyCode = ?',
      [partyCode]
    );

    if (!sessionRows.length) {
      return res.json({ gameEnded: true });
    }

    res.json({ gameEnded: sessionRows[0].isActive === 0 });
  } catch (err) {
    console.error("Error checking game ended:", err);
    res.status(500).json({ gameEnded: false });
  }
});


app.get('/get-players', async (req, res) => {
  const partyCode = req.query.partyCode;
  if (!partyCode) return res.status(400).json([]);

  try {
    const [sessions] = await pool.query('SELECT sessionID, hostID FROM gameSessions WHERE partyCode = ?', [partyCode]);
    if (sessions.length === 0) return res.json([]);

    const sessionID = sessions[0].sessionID;
    const hostID = sessions[0].hostID;

    const [players] = await pool.query(
      'SELECT userID, playerName AS name FROM game_players WHERE sessionID = ?',
      [sessionID]
    );

    const response = players.map(player => ({
      name: player.name,
      isHost: player.userID === hostID
    }));

    res.json(response);
  } catch (err) {
    console.error('Error getting players:', err);
    res.status(500).json([]);
  }
});


app.get('/get-scoreboard', async (req, res) => {
  const partyCode = req.query.partyCode;
  if (!partyCode) return res.status(400).json([]);

  try {
    const [sessions] = await pool.query('SELECT sessionID FROM gameSessions WHERE partyCode = ?', [partyCode]);
    if (sessions.length === 0) return res.json([]);

    const sessionID = sessions[0].sessionID;
    const [players] = await pool.query(
      'SELECT userID, playerName AS name, score, streak FROM game_players WHERE sessionID = ?',
      [sessionID]
    );
    res.json(players);
  } catch (err) {
    console.error('Scoreboard error:', err);
    res.status(500).json([]);
  }
});

app.get('/card/:cardId', async (req, res) => {
  const cardId = req.params.cardId;

  try {
    const [rows] = await pool.query('SELECT * FROM questions WHERE cardID = ?', [cardId]);
    if (rows.length === 0) {
      return res.status(404).send('Question not found.');
    }

    const question = rows[0];
    const partyCode = req.query.partyCode || '';

    res.render('card', {
      question,
      cardId,
      partyCode,
      playerID: req.session.user?.id
    });
  } catch (err) {
    console.error('Error fetching question:', err);
    res.status(500).send('Server error.');
  }
});

app.get('/get-party-code', async (req, res) => {
  const { playerID } = req.query;

  try {
    const [playerRows] = await pool.query(
      'SELECT sessionID FROM game_players WHERE userID = ?',
      [playerID]
    );

    if (playerRows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const [sessionRows] = await pool.query(
      'SELECT partyCode FROM gameSessions WHERE sessionID = ?',
      [playerRows[0].sessionID]
    );

    if (sessionRows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ partyCode: sessionRows[0].partyCode });
  } catch (err) {
    console.error('Error getting party code:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/answer', async (req, res) => {
  try {
    const cardId = req.query.id;
    const selectedAnswer = req.body.answer;
    const playerID = req.body.playerID;

    console.log("Received cardId:", cardId);
    console.log("Received answer:", selectedAnswer);
    console.log("Player ID:", playerID);

    const [questionRows] = await pool.query(
      "SELECT correct_answer FROM questions WHERE cardID = ?",
      [cardId]
    );

    if (questionRows.length === 0) {
      return res.status(400).json({ error: "Question not found" });
    }

    const correctAnswer = questionRows[0].correct_answer;
    const isCorrect = selectedAnswer === correctAnswer;

    const [sessionRows] = await pool.query(
      "SELECT sessionID FROM game_players WHERE userID = ? ORDER BY joinedAt DESC LIMIT 1",
      [playerID]
    );

    if (sessionRows.length === 0) {
      return res.status(400).json({ error: "Session not found for player" });
    }

    const sessionID = sessionRows[0].sessionID;

    const [partyRows] = await pool.query(
      "SELECT partyCode FROM gameSessions WHERE sessionID = ?",
      [sessionID]
    );
    const partyCode = partyRows[0]?.partyCode || '';

    const [playerRows] = await pool.query(
      "SELECT score, streak FROM game_players WHERE sessionID = ? AND userID = ?",
      [sessionID, playerID]
    );

    if (playerRows.length === 0) {
      return res.status(400).json({ error: "Player not found in session" });
    }

    let { score, streak } = playerRows[0];

    if (isCorrect) {
      streak++;
      let reward = 10;
      if (streak >= 3) reward += 10;
      if (streak >= 5) reward += 10;
      score += reward;

      await pool.query(
        "UPDATE game_players SET score = ?, streak = ? WHERE sessionID = ? AND userID = ?",
        [score, streak, sessionID, playerID]
      );
    } else {
      streak = 0;
      await pool.query(
        "UPDATE game_players SET streak = 0 WHERE sessionID = ? AND userID = ?",
        [sessionID, playerID]
      );
    }

    if (score >= 200) {
      return res.json({
        correct: isCorrect,
        redirect: `/win?partyCode=${partyCode}`,
        partyCode
      });
    }

    res.json({
      correct: isCorrect,
      score,
      streak,
      partyCode,
      correctAnswer
    });

  } catch (err) {
    console.error("Error in /answer route:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/check-score', async (req, res) => {
  const { playerID } = req.query;

  try {
    const [rows] = await pool.query(
      "SELECT score FROM game_players WHERE userID = ?",
      [playerID]
    );

    if (rows.length > 0) {
      res.json({ score: rows[0].score });
    } else {
      res.status(404).json({ error: "Player not found" });
    }
  } catch (err) {
    console.error("Error checking score:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/win', async (req, res) => {
  const { partyCode } = req.query;
  if (!partyCode) return res.status(400).send('Missing party code');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [session] = await connection.query(
      'SELECT sessionID FROM gameSessions WHERE partyCode = ?',
      [partyCode]
    );
    if (!session.length) return res.status(404).send('Game not found');

    const [players] = await connection.query(
      'SELECT userID, playerName, score FROM game_players WHERE sessionID = ?',
      [session[0].sessionID]
    );

    const [existingHistory] = await connection.query(
      'SELECT * FROM game_history WHERE sessionID = ?',
      [session[0].sessionID]
    );

    if (existingHistory.length === 0) {
      await connection.query(
        'INSERT INTO game_history (sessionID, partyCode) VALUES (?, ?)',
        [session[0].sessionID, partyCode]
      );
    }

    await connection.query(
      'UPDATE gameSessions SET isActive = 0 WHERE sessionID = ?',
      [session[0].sessionID]
    );

    await connection.commit();

    res.render('win', {
      players: players.sort((a, b) => b.score - a.score),
      partyCode,
      winnerName: players[0]?.playerName || 'No winner'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error ending game:', error);
    res.status(500).send('Server error');
  } finally {
    connection.release();
  }
});

app.get('/history', async (req, res) => {
  if (!req.session.user) return res.redirect('/?sessionExpired=true');

  try {
    const [history] = await pool.query(
      `SELECT 
        gh.partyCode,
        gp.score AS final_score,
        gh.game_date
      FROM game_history gh
      JOIN game_players gp ON gh.sessionID = gp.sessionID
      WHERE gp.userID = ?
      ORDER BY gh.game_date DESC`,
      [req.session.user.id]
    );

    res.render('history', {
      history,
      playerName: req.session.user.playerName
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

app.get('/history/:partyCode', async (req, res) => {
  if (!req.session.user) return res.redirect('/?sessionExpired=true');

  try {
    const [valid] = await pool.query(
      `SELECT 1
      FROM game_history gh
      JOIN game_players gp ON gh.sessionID = gp.sessionID
      WHERE gp.userID = ? AND gh.partyCode = ? LIMIT 1`,
      [req.session.user.id, req.params.partyCode]
    );

    if (!valid.length) return res.status(403).send('Access denied');

    const [players] = await pool.query(
      `SELECT gp.playerName, gp.score
      FROM game_history gh
      JOIN game_players gp ON gh.sessionID = gp.sessionID
      WHERE gh.partyCode = ?
      ORDER BY gp.score DESC`,
      [req.params.partyCode]
    );

    res.render('history-details', {
      partyCode: req.params.partyCode,
      players,
      gameDate: players[0]?.game_date || new Date()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

app.get('/check-active-session', async (req, res) => {
  if (!req.session.user) return res.json({ hasSession: false });

  try {
    const userID = req.session.user.id;
    const [rows] = await pool.query(`
      SELECT gs.partyCode
      FROM game_players gp
      JOIN gameSessions gs ON gp.sessionID = gs.sessionID
      WHERE gp.userID = ? AND gs.isActive = 1 AND gs.hasStarted = 1
      ORDER BY gp.joinedAt DESC LIMIT 1
    `, [userID]);

    if (rows.length === 0) {
      return res.json({ hasSession: false });
    }

    res.json({ hasSession: true, partyCode: rows[0].partyCode });
  } catch (err) {
    console.error('Error checking active session:', err);
    res.status(500).json({ hasSession: false });
  }
});

// 6. Start the Server:
app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
}); 