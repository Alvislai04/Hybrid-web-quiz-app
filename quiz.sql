-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 06, 2025 at 04:56 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quiz`
--

-- --------------------------------------------------------

--
-- Table structure for table `gamesessions`
--

CREATE TABLE `gamesessions` (
  `sessionID` varchar(10) NOT NULL,
  `partyCode` varchar(6) NOT NULL,
  `hostID` varchar(10) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdTime` datetime NOT NULL,
  `hasStarted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gamesessions`
--

INSERT INTO `gamesessions` (`sessionID`, `partyCode`, `hostID`, `isActive`, `createdTime`, `hasStarted`) VALUES
('S1802', 'CJBSAC', 'U2FX', 0, '2025-08-06 20:38:30', 1),
('S3785', 'URAJCT', 'U48130', 0, '2025-08-06 21:48:03', 1),
('S5153', '4JLQYR', 'U757', 0, '2025-08-06 21:40:32', 1),
('S5680', 'LPHG21', 'U2FX', 0, '2025-08-06 18:30:39', 1),
('S5831', '0XZ4FW', 'U2FX', 0, '2025-08-06 18:34:38', 1),
('S6643', 'XUGG33', 'U2FX', 0, '2025-08-06 18:43:36', 1);

-- --------------------------------------------------------

--
-- Table structure for table `game_history`
--

CREATE TABLE `game_history` (
  `id` int(11) NOT NULL,
  `sessionID` varchar(10) NOT NULL,
  `partyCode` varchar(6) NOT NULL,
  `game_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `game_history`
--

INSERT INTO `game_history` (`id`, `sessionID`, `partyCode`, `game_date`) VALUES
(3, 'S5680', 'LPHG21', '2025-08-06 10:31:49'),
(4, 'S5831', '0XZ4FW', '2025-08-06 10:36:01'),
(5, 'S6643', 'XUGG33', '2025-08-06 10:45:13'),
(6, 'S1802', 'CJBSAC', '2025-08-06 12:40:02'),
(7, 'S5153', '4JLQYR', '2025-08-06 13:42:11'),
(8, 'S3785', 'URAJCT', '2025-08-06 14:03:40');

-- --------------------------------------------------------

--
-- Table structure for table `game_players`
--

CREATE TABLE `game_players` (
  `sessionID` varchar(10) NOT NULL,
  `userID` varchar(10) NOT NULL,
  `playerName` varchar(50) NOT NULL,
  `score` int(11) DEFAULT 0,
  `joinedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `streak` int(11) DEFAULT 0,
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `game_players`
--

INSERT INTO `game_players` (`sessionID`, `userID`, `playerName`, `score`, `joinedAt`, `streak`, `id`) VALUES
('S5680', 'U2FX', 'najib', 190, '2025-08-06 10:30:39', 1, 60),
('S5680', 'U757', 'test', 200, '2025-08-06 10:30:45', 1, 61),
('S5831', 'U2FX', 'najib', 170, '2025-08-06 10:34:38', 1, 62),
('S5831', 'U757', 'test', 200, '2025-08-06 10:34:46', 1, 63),
('S6643', 'U2FX', 'najib', 200, '2025-08-06 10:43:36', 1, 64),
('S6643', 'U757', 'test', 80, '2025-08-06 10:43:42', 0, 65),
('S1802', 'U2FX', 'najib', 200, '2025-08-06 12:38:30', 1, 66),
('S1802', 'U757', 'test', 180, '2025-08-06 12:38:53', 0, 67),
('S5153', 'U757', 'test', 210, '2025-08-06 13:40:32', 6, 73),
('S5153', 'U2FX', 'najib', 120, '2025-08-06 13:40:48', 3, 74),
('S3785', 'U48130', 'Yuan Yuan', 10, '2025-08-06 13:48:03', 1, 76),
('S3785', 'U75841', 'Wxyz', 200, '2025-08-06 13:49:27', 1, 77);

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `cardID` varchar(10) NOT NULL,
  `question_text` varchar(255) DEFAULT NULL,
  `option_a` varchar(255) NOT NULL,
  `option_b` varchar(255) NOT NULL,
  `option_c` varchar(255) NOT NULL,
  `option_d` varchar(255) NOT NULL,
  `correct_answer` char(1) NOT NULL CHECK (`correct_answer` in ('A','B','C','D'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`cardID`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`) VALUES
('QC001', 'What keyword is used to define a function in Python?', 'def', 'function', 'define', 'func', 'A'),
('QC002', 'Which of the following is a valid function name in Python?', '1function', 'function_1', 'function-1', 'function 1', 'B'),
('QC003', 'What does a function return by default if there is no return statement?', '0', 'None', 'undefined', 'Error', 'B'),
('QC004', 'Which keyword is used to return a value from a function?', 'return', 'yield', 'break', 'continue', 'A'),
('QC005', 'How do you call a function named \'my_func\'?', 'call my_func', 'my_func()', 'my_func[]', 'run(my_func)', 'B'),
('QC006', 'Which of the following is NOT a valid function definition?', 'def foo():', 'def foo(): return 1', 'def foo: pass', 'def foo(): pass', 'C'),
('QC007', 'What is the default return value of a void function?', '0', 'null', 'None', 'False', 'C'),
('QC008', 'Can you define a function inside another function in Python?', 'Yes', 'No', 'Only in classes', 'Only with decorators', 'A'),
('QC009', 'Which symbol is used to start defining parameters?', '()', '[]', '{}', '<>', 'A'),
('QC010', 'What does the pass statement do in a function?', 'Ends function', 'Skips execution', 'Does nothing', 'Repeats function', 'C'),
('QC011', 'What type of value can a function return?', 'Only int', 'Only strings', 'Any data type', 'None only', 'C'),
('QC012', 'How are function parameters defined?', 'Inside brackets', 'Inside square brackets', 'Inside angle brackets', 'Inside parentheses', 'D'),
('QC013', 'What does the following return? def test(): pass', 'Error', 'None', 'test', '0', 'B'),
('QC014', 'What is printed? def foo(): return \'Hi\' print(foo())', 'foo', 'Hi', 'None', 'Error', 'B'),
('QC015', 'Where are function parameters written?', 'After function name in parentheses', 'After colon', 'Inside function body', 'They aren\'t needed', 'A'),
('QC016', 'What will print()? def add(a, b): return a + b print(add(2, 3))', '23', '5', 'Error', '2+3', 'B'),
('QC017', 'What is a parameter?', 'Value returned', 'Variable in function', 'Function name', 'Return type', 'B'),
('QC018', 'Which keyword is optional in a function?', 'def', 'return', 'function', 'call', 'B'),
('QC019', 'Which is used to exit a function early?', 'break', 'return', 'stop', 'exit', 'B'),
('QC020', 'Can functions call other functions?', 'No', 'Only in classes', 'Yes', 'Only if imported', 'C'),
('QC021', 'What is the scope of a variable defined in a function?', 'Global', 'Local', 'Class', 'Module', 'B'),
('QC022', 'Which of these is a correct function call?', 'func{}', 'func()', 'call func', 'func[]', 'B'),
('QC023', 'What will this return? def f(): return print(\'Hello\')', 'Hello', 'None', 'Error', '\'Hello\'', 'A'),
('QC024', 'How to define a function with optional parameters?', 'Use *args', 'Use **kwargs', 'Assign default values', 'Leave them blank', 'C'),
('QC025', 'What is *args?', 'Tuple of positional arguments', 'List of keywords', 'Single string', 'Dictionary', 'A'),
('QC026', 'What is **kwargs used for?', 'Return multiple values', 'Accept keyword arguments', 'Define class', 'None', 'B'),
('QC027', 'What happens if you define two functions with same name?', 'Error', 'Last one overwrites', 'Both exist', 'They merge', 'B'),
('QC028', 'What is a docstring?', 'Comment at top', 'String in print()', 'String in function to describe it', 'None', 'C'),
('QC029', 'How to access docstring?', 'func.doc', 'func.__doc__', 'func:doc', 'func.doc()', 'B'),
('QC030', 'How to pass a list to a function?', 'func[*list]', 'func(list)', 'func@list', 'pass list func', 'B'),
('QC031', 'How to return multiple values?', 'Comma-separated return', 'List return', 'Tuple return', 'All of the above', 'D'),
('QC032', 'What is a lambda?', 'Named function', 'Anonymous function', 'Recursive function', 'Built-in function', 'B'),
('QC033', 'What’s output? def f(): x=5 return x print(f())', 'f', 'None', '5', 'Error', 'C'),
('QC034', 'Can you return a function from a function?', 'Yes', 'No', 'Only in loops', 'Only classes', 'A'),
('QC035', 'Which function allows dynamic number of arguments?', '*args', 'static', 'optional', 'kwargs only', 'A'),
('QC036', 'What is printed? def f(x=3): return x*x print(f())', '6', '9', '3', 'Error', 'B'),
('QC037', 'Which keyword is used for anonymous functions?', 'def', 'lambda', 'none', 'anon', 'B'),
('QC038', 'Can you assign a function to a variable?', 'Yes', 'No', 'Only with decorators', 'Only in classes', 'A'),
('QC039', 'Which of these calls a function inside a list comprehension?', '[f(x) for x in lst]', '[x for x in f(lst)]', '[x() for x in lst]', '[f for x in lst]', 'A'),
('QC040', 'What’s wrong with def f(a, b=2, c)?', 'Too many args', 'Invalid syntax', 'Non-default arg after default', 'Nothing', 'C'),
('QC041', 'Can functions be recursive?', 'Yes', 'No', 'Only in C', 'Not in Python', 'A'),
('QC042', 'What’s the output? def f(): return \'A\'; def g(): return f(); print(g())', 'f', 'g', 'A', 'Error', 'C'),
('QC043', 'What will this print? def f(): try: return 1 finally: return 2 print(f())', '1', '2', 'None', 'Error', 'B'),
('QC044', 'Which is a closure?', 'Function returning another function with captured vars', 'Class method', 'Lambda', 'Recursion', 'A'),
('QC045', 'What is decorator used for?', 'Modify function behavior', 'Call function', 'Class attribute', 'Global variable', 'A'),
('QC046', 'How to apply multiple decorators?', 'Separate lines with @', 'Comma separate', 'Inside function', 'Only one allowed', 'A'),
('QC047', 'Can you define a generator using def?', 'Yes, with yield', 'No', 'Only with lambda', 'Only classes', 'A'),
('QC048', 'How to indicate a generator?', 'use return', 'use yield', 'use pass', 'use def', 'B'),
('QC049', 'What’s output? def f(): yield 1 yield 2 print(list(f()))', '[1, 2]', '1 2', 'Error', '[1][2]', 'A'),
('QC050', 'Which one is a valid recursive base case?', 'if n==0: return 1', 'if: return', 'for i in n: return', 'return n', 'A'),
('QC051', 'How can you stop infinite recursion?', 'Limit call stack', 'Use base case', 'Set recursion limit', 'Use break', 'B'),
('QC052', 'What’s the return? def f(x): if x<=1: return 1 else: return x*f(x-1)', 'x!', 'x', 'x-1', '1', 'A'),
('QC053', 'How to write a pure function?', 'No side effects', 'Modify global', 'Use print', 'Raise error', 'A'),
('QC054', 'What is a side effect in function?', 'Returning value', 'Modifying global state', 'Passing args', 'Calling other functions', 'B'),
('QC055', 'What is currying in Python?', 'Transforming a function with multiple args into chain of functions', 'Using curries', 'List of functions', 'Functional programming', 'A'),
('QC056', 'What does functools.wraps do?', 'Preserve metadata', 'Wrap a list', 'Alias function', 'Decorate a class', 'A'),
('QC057', 'What is a callback function?', 'Function passed as argument', 'Recursive', 'Loop', 'Return type', 'A'),
('QC058', 'What is a higher-order function?', 'Takes/returns another function', 'Recursion', 'String function', 'Only built-in', 'A'),
('QC059', 'What does inspect.signature() do?', 'Returns function arguments', 'Print doc', 'Show stack', 'Returns None', 'A'),
('QC060', 'Which error for too many args?', 'TypeError', 'ValueError', 'SyntaxError', 'ArgError', 'A'),
('QC061', 'How do you memoize a function?', 'Use dict', 'Use cache', 'Use @lru_cache', 'Use lambda', 'C'),
('QC062', 'What will `*` in def func(*, a, b)` do?', 'Force keyword args', 'Accept positional args', 'Error', 'Default values', 'A');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` varchar(10) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `salt` varchar(255) DEFAULT NULL,
  `playerName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `password_hash`, `salt`, `playerName`) VALUES
('U2FX', 'najib@gmail.com', '$2b$10$tk4yya3N3NSGXSTtdqQtW.wpkaGXhAlwIU/V572dIJOkyQoGo0pMK', 'cb6f52b0dd11101f37d8ceb17a0e1dec', 'najib'),
('U48130', 'alvis', '$2b$10$bCs90GoKNh9pxgTJ68Srhu7NHoUphFeYer1k6x4eN7EsBZemNkhgC', 'adc1083bd11f5d8a4cc917530fef5833', 'Yuan Yuan'),
('U757', 'test@gmail.com', '$2b$10$ASdMFZxsWOEMXXV7p5rUTeo/cgWZ71qGS3GfiTtHQMnO2WZcuiYPe', '1f87bda6b0f11e1c28c616b0afab8249', 'test'),
('U75841', 'Wongxinyi', '$2b$10$6GqceCfvd6pxPwV4qzVTKOeBYzCLPL02n2umtkdcE19AL1yxexwYi', '58edf84deb05ad375eb43c1e2690d244', 'Wxyz');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `gamesessions`
--
ALTER TABLE `gamesessions`
  ADD PRIMARY KEY (`sessionID`),
  ADD UNIQUE KEY `partyCode` (`partyCode`),
  ADD UNIQUE KEY `sessionID` (`sessionID`),
  ADD UNIQUE KEY `partyCode_2` (`partyCode`);

--
-- Indexes for table `game_history`
--
ALTER TABLE `game_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `game_players`
--
ALTER TABLE `game_players`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_players_ibfk_1` (`sessionID`),
  ADD KEY `user_session_index` (`userID`,`sessionID`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`cardID`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `game_history`
--
ALTER TABLE `game_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `game_players`
--
ALTER TABLE `game_players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `game_players`
--
ALTER TABLE `game_players`
  ADD CONSTRAINT `game_players_ibfk_1` FOREIGN KEY (`sessionID`) REFERENCES `gamesessions` (`sessionID`),
  ADD CONSTRAINT `game_players_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
