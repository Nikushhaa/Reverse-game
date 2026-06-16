"use strict";

// ==============================
// Constants - ყველა string ერთ ადგილას
// ==============================
const COLOR_WHITE = "white";
const COLOR_BLACK = "black";

const CLASS_PIECE = "piece";
const CLASS_SQUARE = "square";

const DATASET_ID = "id";

const ELEM_STATUS = "status";
const ELEM_BOARD = "board";
const ELEM_RESTART = "restart";
const ELEM_BG_PICKER = "bgPicker";
const ELEM_FONT_PICKER = "fontPicker";

const STATUS_TURN_BLACK = "Turn: Black";
const STATUS_TURN_WHITE = "Turn: White";
const STATUS_BLACK_WINS = "Black Wins!";
const STATUS_WHITE_WINS = "White Wins!";
const STATUS_DRAW = "Draw!";

const PROP_BACKGROUND = "background";
const PROP_FONT_FAMILY = "fontFamily";

const STORAGE_BG = "reversi_bg";
const STORAGE_FONT = "reversi_font";
const STORAGE_WINS = "reversi_wins";
const STORAGE_LOSSES = "reversi_losses";
const STORAGE_DRAWS = "reversi_draws";

const ELEM_WINS = "stat-wins";
const ELEM_LOSSES = "stat-losses";
const ELEM_DRAWS = "stat-draws";
const ELEM_RESET_STATS = "resetStats";

const COOKIE_DAYS = 30;

const AI_DELAY_MS = 400;

// ==============================
// Cookie Helper Functions
// ==============================

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [key, val] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(val);
  }
  return null;
}

// ==============================
// Stats
// ==============================

function updateStats() {
  document.getElementById(ELEM_WINS).textContent = getCookie(STORAGE_WINS) || 0;
  document.getElementById(ELEM_LOSSES).textContent =
    getCookie(STORAGE_LOSSES) || 0;
  document.getElementById(ELEM_DRAWS).textContent =
    getCookie(STORAGE_DRAWS) || 0;
}

const MINIMAX_DEPTH = 3;
const CORNER_BONUS = 50;

// ==============================
// Classes
// ==============================

class Piece {
  constructor(color) {
    this.color = color;
  }
  draw() {
    const d = document.createElement("div");
    d.classList.add(CLASS_PIECE, this.color);
    return d;
  }
}

class Cell {
  constructor(r, c) {
    this.row = r;
    this.col = c;
    this.id = `${r}-${c}`;
    this.piece = null;
  }
  draw() {
    const d = document.createElement("div");
    d.classList.add(CLASS_SQUARE);
    d.dataset[DATASET_ID] = this.id;
    if (this.piece) d.appendChild(this.piece.draw());
    return d;
  }
}

class Board {
  constructor(el) {
    this.el = el;
    this.cells = {};
    this.matrix = Array.from({ length: 8 }, () => Array(8).fill(null));

    this.matrix[3][3] = COLOR_WHITE;
    this.matrix[4][4] = COLOR_WHITE;
    this.matrix[3][4] = COLOR_BLACK;
    this.matrix[4][3] = COLOR_BLACK;

    this.turn = COLOR_BLACK;
    this.status = document.getElementById(ELEM_STATUS);

    this.createCells();
    this.draw();
    this.events();
  }

  createCells() {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        let cell = new Cell(r, c);
        this.cells[cell.id] = cell;
      }
    }
  }

  draw() {
    this.el.innerHTML = "";
    for (let id in this.cells) {
      let cell = this.cells[id];
      let [r, c] = id.split("-").map(Number);
      cell.piece = this.matrix[r][c] ? new Piece(this.matrix[r][c]) : null;
      this.el.appendChild(cell.draw());
    }
  }

  directions() {
    return [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ];
  }

  validMove(r, c, color) {
    if (this.matrix[r][c]) return false;
    let enemy = color === COLOR_BLACK ? COLOR_WHITE : COLOR_BLACK;

    for (let [dr, dc] of this.directions()) {
      let x = r + dr,
        y = c + dc,
        found = false;

      while (
        x >= 0 &&
        x < 8 &&
        y >= 0 &&
        y < 8 &&
        this.matrix[x][y] === enemy
      ) {
        found = true;
        x += dr;
        y += dc;
      }

      if (
        found &&
        x >= 0 &&
        x < 8 &&
        y >= 0 &&
        y < 8 &&
        this.matrix[x][y] === color
      )
        return true;
    }
    return false;
  }

  getMoves(color) {
    let moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.validMove(r, c, color)) moves.push([r, c]);
      }
    }
    return moves;
  }

  move(r, c, color) {
    this.matrix[r][c] = color;
    let enemy = color === COLOR_BLACK ? COLOR_WHITE : COLOR_BLACK;

    for (let [dr, dc] of this.directions()) {
      let x = r + dr,
        y = c + dc;
      let change = [];

      while (
        x >= 0 &&
        x < 8 &&
        y >= 0 &&
        y < 8 &&
        this.matrix[x][y] === enemy
      ) {
        change.push([x, y]);
        x += dr;
        y += dc;
      }

      if (x >= 0 && x < 8 && y >= 0 && y < 8 && this.matrix[x][y] === color) {
        for (let [a, b] of change) this.matrix[a][b] = color;
      }
    }
  }

  events() {
    this.el.onclick = (e) => {
      let sq = e.target.closest(`.${CLASS_SQUARE}`);
      if (!sq) return;
      if (this.turn !== COLOR_BLACK) return;

      let [r, c] = sq.dataset[DATASET_ID].split("-").map(Number);

      if (!this.validMove(r, c, COLOR_BLACK)) return;

      this.move(r, c, COLOR_BLACK);
      this.draw();

      if (this.gameOver()) {
        this.end();
        return;
      }

      this.turn = COLOR_WHITE;
      this.status.textContent = STATUS_TURN_WHITE;

      setTimeout(() => this.aiMove(), AI_DELAY_MS);
    };
  }

  aiMove() {
    let best = -Infinity;
    let bestMove = null;

    for (let [r, c] of this.getMoves(COLOR_WHITE)) {
      this.matrix[r][c] = COLOR_WHITE;
      let score = this.minimax(MINIMAX_DEPTH, false);
      this.matrix[r][c] = null;

      if (score > best) {
        best = score;
        bestMove = [r, c];
      }
    }

    if (bestMove) this.move(bestMove[0], bestMove[1], COLOR_WHITE);
    this.draw();

    if (this.gameOver()) {
      this.end();
      return;
    }

    this.turn = COLOR_BLACK;
    this.status.textContent = STATUS_TURN_BLACK;
  }

  minimax(depth, maximizing) {
    if (depth === 0 || this.gameOver()) return this.evaluate();

    let color = maximizing ? COLOR_WHITE : COLOR_BLACK;
    let moves = this.getMoves(color);

    if (moves.length === 0) return this.evaluate();

    if (maximizing) {
      let best = -Infinity;
      for (let [r, c] of moves) {
        this.matrix[r][c] = COLOR_WHITE;
        best = Math.max(best, this.minimax(depth - 1, false));
        this.matrix[r][c] = null;
      }
      return best;
    } else {
      let best = Infinity;
      for (let [r, c] of moves) {
        this.matrix[r][c] = COLOR_BLACK;
        best = Math.min(best, this.minimax(depth - 1, true));
        this.matrix[r][c] = null;
      }
      return best;
    }
  }

  evaluate() {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.matrix[r][c] === COLOR_WHITE) score += 1;
        if (this.matrix[r][c] === COLOR_BLACK) score -= 1;

        if ((r === 0 || r === 7) && (c === 0 || c === 7)) {
          if (this.matrix[r][c] === COLOR_WHITE) score += CORNER_BONUS;
          if (this.matrix[r][c] === COLOR_BLACK) score -= CORNER_BONUS;
        }
      }
    }
    return score;
  }

  gameOver() {
    return (
      this.getMoves(COLOR_BLACK).length === 0 &&
      this.getMoves(COLOR_WHITE).length === 0
    );
  }

  end() {
    let black = 0;
    let white = 0;

    for (let row of this.matrix) {
      for (let c of row) {
        if (c === COLOR_BLACK) black++;
        if (c === COLOR_WHITE) white++;
      }
    }

    let wins = parseInt(getCookie(STORAGE_WINS)) || 0;
    let losses = parseInt(getCookie(STORAGE_LOSSES)) || 0;
    let draws = parseInt(getCookie(STORAGE_DRAWS)) || 0;

    if (black > white) {
      this.status.textContent = STATUS_BLACK_WINS;
      wins++;
      setCookie(STORAGE_WINS, wins, COOKIE_DAYS);
    } else if (white > black) {
      this.status.textContent = STATUS_WHITE_WINS;
      losses++;
      setCookie(STORAGE_LOSSES, losses, COOKIE_DAYS);
    } else {
      this.status.textContent = STATUS_DRAW;
      draws++;
      setCookie(STORAGE_DRAWS, draws, COOKIE_DAYS);
    }

    updateStats();
  }

  restart() {
    this.matrix = Array.from({ length: 8 }, () => Array(8).fill(null));

    this.matrix[3][3] = COLOR_WHITE;
    this.matrix[4][4] = COLOR_WHITE;
    this.matrix[3][4] = COLOR_BLACK;
    this.matrix[4][3] = COLOR_BLACK;

    this.turn = COLOR_BLACK;
    this.status.textContent = STATUS_TURN_BLACK;

    this.draw();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const board = new Board(document.getElementById(ELEM_BOARD));

  const savedBg = getCookie(STORAGE_BG);
  const savedFont = getCookie(STORAGE_FONT);

  if (savedBg) {
    document.body.style[PROP_BACKGROUND] = savedBg;
    document.getElementById(ELEM_BG_PICKER).value = savedBg;
  }

  if (savedFont) {
    document.body.style[PROP_FONT_FAMILY] = savedFont;
    document.getElementById(ELEM_FONT_PICKER).value = savedFont;
  }

  updateStats();

  document.getElementById(ELEM_RESTART).onclick = () => board.restart();

  document.getElementById(ELEM_BG_PICKER).oninput = (e) => {
    document.body.style[PROP_BACKGROUND] = e.target.value;
    setCookie(STORAGE_BG, e.target.value, COOKIE_DAYS);
  };

  document.getElementById(ELEM_FONT_PICKER).onchange = (e) => {
    document.body.style[PROP_FONT_FAMILY] = e.target.value;
    setCookie(STORAGE_FONT, e.target.value, COOKIE_DAYS);
  };

  document.getElementById(ELEM_RESET_STATS).onclick = () => {
    setCookie(STORAGE_WINS, 0, COOKIE_DAYS);
    setCookie(STORAGE_LOSSES, 0, COOKIE_DAYS);
    setCookie(STORAGE_DRAWS, 0, COOKIE_DAYS);
    updateStats();
  };

  window.board = board;
});
