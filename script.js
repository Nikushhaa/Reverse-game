"use strict";

class Piece {
  constructor(color) {
    // constructor იძახება მაშინ, როცა ახალ Piece-ს ვქმნით.
    // მაგალითად: new Piece("white")
    this.color = color; // ვინახავთ ფიგურის ფერს ობიექტში.
    // მაგალითად თუ color არის "white",
    // მაშინ ეს ფიგურა იქნება თეთრი.
    // this.color ნიშნავს ამ კონკრეტული ფიგურის ფერის თვისებას.
  }
  draw() {
    const d = document.createElement("div");
    d.classList.add("piece", this.color);
    return d; // ვაბრუნებთ შექმნილ div ელემენტს.
    // სხვა კოდს შეუძლია ეს ელემენტი ჩასვას დაფაზე.
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
    d.classList.add("square");
    d.dataset.id = this.id; // inaxeba ujris ID rata vicodet romel ujras davachiret
    if (this.piece) d.appendChild(this.piece.draw());
    return d;
  }
}

class Board {
  constructor(el) {
    this.el = el;
    this.cells = {};
    this.matrix = Array.from({ length: 8 }, () => Array(8).fill(null));

    this.matrix[3][3] = "white";
    this.matrix[4][4] = "white";
    this.matrix[3][4] = "black";
    this.matrix[4][3] = "black";

    this.turn = "black";
    this.status = document.getElementById("status");

    this.createCells();
    this.draw();
    this.events();
  }

  createCells() {
    for (let r = 0; r < 8; r++) {
      // titoeul rigshi unda iyos 8 ujra
      for (let c = 0; c < 8; c++) {
        let cell = new Cell(r, c);
        this.cells[cell.id] = cell; //axal sheqmnil ujras vinaxavt cell masivshi, ID s mixedvit swrafad vpoulobt ujras
      }
    }
  }

  draw() {
    this.el.innerHTML = "";
    for (let id in this.cells) {
      // გადავდივართ ყველა უჯრაზე.
      // this.cells შეიცავს ყველა Cell ობიექტს.
      // მაგალითად:
      // "0-0" → პირველი უჯრა
      // "0-1" → მეორე უჯრა
      // ...
      // "7-7" → ბოლო უჯრა
      let cell = this.cells[id]; // მიმდინარე უჯრას ვინახავთ ცვლადში.
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
    if (this.matrix[r][c]) return false; // tu dakavebulia ar aketebs svlas
    let enemy = color === "black" ? "white" : "black";

    for (let [dr, dc] of this.directions()) {
      //gadavdivart yvela shesadzlo directions ze
      let x = r + dr,
        y = c + dc,
        found = false; //vipovet tu ara mowinaagmdegis figura gzashi

      while (
        x >= 0 &&
        x < 8 &&
        y >= 0 &&
        y < 8 &&
        this.matrix[x][y] === enemy // სანამ:
        // 1. არ გავცდით დაფას
        // 2. მიმდინარე უჯრაზე მოწინააღმდეგის ფიგურაა
        //
        // გავაგრძელოთ წინ სვლა.
      ) {
        found = true;
        x += dr;
        y += dc;
      } // tu vipovet mowinaagmdege mashin gadavdivart mainc imave mimartulebit

      if (
        found &&
        x >= 0 &&
        x < 8 &&
        y >= 0 &&
        y < 8 &&
        this.matrix[x][y] === color // აქ ვამოწმებთ მთავარ წესს:
        //
        // თუ:
        // 1. გზაში ვიპოვეთ მოწინააღმდეგე
        // 2. დაფის გარეთ არ გავედით
        // 3. ბოლოს ვიპოვეთ ჩვენი ფერის ფიგურა
        //
        // მაშინ სვლა სწორია.
      )
        return true;
    }
    return false; // თუ არცერთ მიმართულებაში ვერ ვიპოვეთ სწორი ხაზი,
    // სვლა არ შეიძლება.
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

    let enemy = color === "black" ? "white" : "black";

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
      // ვეძებთ იმ უჯრას (.square), რომელზეც მოთამაშემ დააჭირა
      // e.target არის ზუსტად ის HTML ელემენტი, რომელსაც დააჭირა მომხმარებელმა
      // closest პოულობს მის ზემოთ არსებულ პირველ .square ელემენტს
      let sq = e.target.closest(".square");
      if (!sq) return;
      // თუ ახლა შავის (მოთამაშის) სვლა არ არის
      // მაგალითად AI ფიქრობს, მოთამაშე ვერ ითამაშებს
      if (this.turn !== "black") return;

      let [r, c] = sq.dataset.id.split("-").map(Number); // ვიღებთ უჯრის კოორდინატებს
      // მაგალითად "3-5" გადაიქცევა [3,5]-ად

      if (!this.validMove(r, c, "black")) return;
      // ვამოწმებთ შეიძლება თუ არა ამ ადგილზე შავი ქვის დადება
      // თუ სვლა არასწორია, ფუნქცია წყდება

      this.move(r, c, "black");
      // ვაკეთებთ შავი ქვის სვლას
      // ვამატებთ ქვას და ვაბრუნებთ მოწინააღმდეგის ქვებს
      this.draw();
      // თავიდან ვხატავთ დაფას
      // რომ ახალი ქვები და გადაბრუნებული ქვები გამოჩნდეს ეკრანზე

      if (this.gameOver()) {
        this.end();
        return;
      }

      this.turn = "white";
      this.status.textContent = "Turn: White";
      // სტატუსში ვწერთ, რომ თეთრის სვლაა
      // ანუ ახლა AI თამაშობს

      setTimeout(() => this.aiMove(), 400); // ვაყოვნებთ AI-ის სვლას 400 მილიწამით
      // რომ AI-მ მაშინვე არ ითამაშოს და ვიზუალურად გამოჩნდეს
    };
  }

  aiMove() {
    // ვინახავთ საუკეთესო ქულის მნიშვნელობას
    // თავიდან ვაყენებთ ძალიან პატარა რიცხვზე,
    // რათა ნებისმიერი ნორმალური სვლა უკეთესი აღმოჩნდეს
    let best = -Infinity;
    // აქ შევინახავთ იმ სვლის კოორდინატებს,
    // რომელიც AI-სთვის ყველაზე კარგი იქნება
    // თავიდან სვლა არ გვაქვს
    let bestMove = null;
    // ვიღებთ ყველა შესაძლო სვლას თეთრისთვის (AI)
    // მაგალითად: [[2,3], [4,5], [6,2]]
    for (let [r, c] of this.getMoves("white")) {
      // დროებით ვსვამთ AI-ის ქვას ამ ადგილას
      // რეალურად ჯერ არ ვაკეთებთ სვლას,
      // უბრალოდ ვამოწმებთ რა მოხდება
      this.matrix[r][c] = "white";

      let score = this.minimax(3, false); // Minimax ითვლის ამ სვლის შედეგს
      // 3 ნიშნავს, რომ AI 3 ნაბიჯის წინ იყურება
      // false ნიშნავს, რომ შემდეგ მოთამაშის (black) სვლაა

      this.matrix[r][c] = null; // ვშლით დროებით გაკეთებულ სვლას
      // რადგან შემდეგი ვარიანტი სუფთა დაფაზე უნდა შევამოწმოთ

      if (score > best) {
        best = score;
        bestMove = [r, c];
      }
    }

    if (bestMove) this.move(bestMove[0], bestMove[1], "white"); // ვაკეთებთ რეალურ სვლას
    // აქ უკვე ქვა ნამდვილად ემატება დაფაზე

    this.draw();
    // თავიდან ვხატავთ დაფას,
    // რომ AI-ის ახალი ქვა გამოჩნდეს

    if (this.gameOver()) {
      this.end();
      return;
    }

    this.turn = "black";
    this.status.textContent = "Turn: Black";
  }

  minimax(depth, maximizing) {
    if (depth === 0 || this.gameOver()) return this.evaluate();

    let color = maximizing ? "white" : "black"; // vin aketebs svlas
    let moves = this.getMoves(color); //tu motamashis jeria mashin black tu AI s jeria mag shemtxvevashi white

    if (moves.length === 0) return this.evaluate(); // tu ar aris svla, shegidzlia daqvs evaluate

    if (maximizing) {
      let best = -Infinity;

      for (let [r, c] of moves) {
        this.matrix[r][c] = "white"; //yvela shesadzlo svlis gamocda

        best = Math.max(best, this.minimax(depth - 1, false)); //"თუ მე აქ დავდგები, მერე მოთამაშე რას იზამს?"

        this.matrix[r][c] = null;
      }

      return best;
    } else {
      let best = Infinity;

      for (let [r, c] of moves) {
        this.matrix[r][c] = "black";

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
        if (this.matrix[r][c] === "white") score += 1;

        if (this.matrix[r][c] === "black") score -= 1;

        if ((r === 0 || r === 7) && (c === 0 || c === 7)) {
          if (this.matrix[r][c] === "white") score += 50;

          if (this.matrix[r][c] === "black") score -= 50;
        }
      }
    }

    return score;
  }

  gameOver() {
    return (
      this.getMoves("black").length === 0 && this.getMoves("white").length === 0
    );
  }

  end() {
    let black = 0;
    let white = 0;

    for (let row of this.matrix) {
      // vatarebt matrixze romelic aris 8x8, romelic shegidzlia daqvs black da white pieces
      for (let c of row) {
        // row ari dafis erti sruli rigi      // ამ ციკლით გადავდივართ კონკრეტული რიგის ყველა უჯრაზე
        if (c === "black") black++;
        if (c === "white") white++; //c aris erti ujris mnishvneloba
      }
    }

    if (black > white) this.status.textContent = "Black Wins!";
    else if (white > black) this.status.textContent = "White Wins!";
    else this.status.textContent = "Draw!";
  }

  restart() {
    // tavidan iwyeba tamashi
    this.matrix = Array.from({ length: 8 }, () => Array(8).fill(null));
    // თავიდან ვქმნით ცარიელ 8x8 დაფას
    // ყველა უჯრაში თავიდან null იქნება

    this.matrix[3][3] = "white";
    this.matrix[4][4] = "white";
    this.matrix[3][4] = "black";
    this.matrix[4][3] = "black";

    // ვაბრუნებთ Reverse-ის საწყის ოთხ ქვას შუაში
    // ზედა მარცხენა შუა ქვა არის თეთრი

    this.turn = "black";
    this.status.textContent = "Turn: Black";

    // სტატუსის ტექსტს ვცვლით
    // ვეუბნებით მოთამაშეს, რომ შავის სვლაა

    this.draw();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const board = new Board(document.getElementById("board"));

  document.getElementById("restart").onclick = () => board.restart(); // restart ღილაკზე დაჭერისას ვიძახებთ board-ის restart ფუნქციას

  document.getElementById("bgPicker").oninput = (e) => {
    // background color picker-ის ცვლილებისას
    // ვიღებთ არჩეულ ფერს
    document.body.style.background = e.target.value;
  };

  document.getElementById("fontPicker").onchange = (e) => {
    document.body.style.fontFamily = e.target.value;
  };
  // board-ს ვინახავთ window-ში
  // ამის შემდეგ კონსოლიდანაც შეგვიძლია მივწვდეთ:
  // window.board
  window.board = board;
});
