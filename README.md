# Reverse Game 🎮

## About

Reverse Game is a classic strategy board game implementation based on **Reversi (Othello)**.

The game allows players to compete against an AI opponent by placing pieces on an 8x8 board. Each move is calculated according to the official Reversi rules, where players capture opponent pieces by surrounding them.

This project was created to practice **game development logic, object-oriented programming, algorithms, and artificial intelligence decision-making**.

---



## Features

- 🎮 Classic Reversi/Othello gameplay
- ⚫⚪ Player vs AI mode
- 🧠 AI opponent with move evaluation
- ♟️ Automatic piece flipping system
- ✅ Valid move detection
- 📊 Score calculation
- 🔄 Turn management
- 🏆 Win/loss detection
- 🎨 Interactive game board
- ⚡ Real-time game updates

---

## AI System

The AI opponent uses a decision-making algorithm to select better moves.

The AI:

1. Finds all possible valid moves.
2. Simulates each possible move.
3. Evaluates the result of each move.
4. Chooses the move with the highest score.

The evaluation considers factors such as:

- Number of pieces controlled
- Board position advantage
- Possible future moves
- Game outcome prediction

---

## Technologies Used

- JavaScript
- HTML5
- CSS3
- Object-Oriented Programming
- Minimax Algorithm
- Game State Evaluation

---

## How It Works

### Game Logic

1. The game starts with the four initial pieces in the center.
2. Players take turns placing pieces on valid positions.
3. When a piece surrounds opponent pieces, those pieces are flipped.
4. The board updates after every move.
5. The player with the most pieces at the end wins.

### AI Logic

1. The AI checks every available move.
2. Each move is temporarily simulated.
3. The resulting board state is evaluated.
4. The AI selects the strongest move.

---

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/Nikushhaa/Reverse-Game.git
```

### 2. Open the project folder

```bash
cd Reverse-Game
```

### 3. Run the game

Open:

```
index.html
```

in your browser.

No additional installation is required.

---

## Project Structure

```
Reverse-Game/
│
├── index.html              # Game interface
│
├── style.css               # Board and UI styling
│
├── script.js               # Main game logic and AI system
│
├── images/
│   └── reverse-demo.gif    # Game demonstration
│
└── README.md               # Project documentation
```

---

## Future Improvements

- Improve AI difficulty levels
- Add stronger minimax depth
- Add alpha-beta pruning optimization
- Add player vs player mode
- Add online multiplayer
- Add game statistics
- Add move history
- Add animations for piece flipping
- Add sound effects
- Add customizable board themes

---

## Author

Created by **Nikushhaa**

GitHub:
https://github.com/Nikushhaa
