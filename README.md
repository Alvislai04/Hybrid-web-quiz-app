# 🎲 Hybrid Web Quiz App

## 📌 Project Overview
The **Hybrid Web Quiz App** is a multiplayer web-based game that combines a Monopoly-style board game with Python programming quiz cards.  

Players move across the board, scan QR codes or enter party codes to join lobbies, and answer Python-related questions to gain points.  
The first player to reach **200 points** is declared as the winner.  

This project was developed as part of an individual university assignment for *Further Web Design & Development*, showcasing skills in full-stack development, database design, and real-time interaction.  

---

## 🎯 Objectives
- Create an interactive quiz platform with gamified elements.  
- Support multiplayer sessions with lobby creation and joining via party codes/QR codes.  
- Implement a real-time scoring system with streak rewards and automatic winner detection.  
- Provide a responsive UI for consistent gameplay across devices.  

---

## 🔍 Features
- **User Authentication**: Register and log in securely.  
- **Lobby System**: Create and join multiplayer sessions with party codes or QR codes.  
- **Board Game Mechanics**: Players move forward by answering Python quiz questions.  
- **Quiz Engine**: 62+ Python programming questions (multiple choice).  
- **Scoring & Streak Rewards**: Bonus points for consecutive correct answers.  
- **Winning Screen**: Displays the winner and ranked scoreboard for all players.  
- **Responsive Design**: Works smoothly on desktop, tablet, and mobile.  

---

## 🛠️ Tech Stack

**Frontend:**  
- Pug (HTML templating)  
- CSS3 (animations, responsive design)  
- JavaScript (client-side validation & interactivity)  

**Backend:**  
- Node.js + Express  
- MySQL (database for users, game sessions, and scores)  

**Other Tools:**  
- GitHub (version control)  

---

## 🚀 How to Run the Project

**1. Clone this repository:**
```bash
git clone https://github.com/Alvislai04/Hybrid-web-quiz-app.git
cd Hybrid-web-quiz-app

2. Install dependencies:
npm install


3. Import the database:
Open MySQL Workbench / phpMyAdmin.
Import quiz.sql (included in repo).


4. Start the server:
node app.js


5. Open your browser at:
👉 http://localhost:3000
