import { Component } from '@angular/core';

enum BOARD {
  MAX_COL = 7,
  MAX_ROW = 7
}

interface Cell {
  row: number;
  col: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  board: number[][] = [];
  selectedIndex = 0;
  gameEndMarbleCount = 0;
  gameEnd = false;
  playingFeedback = '';
  gameStarted = false;

  constructor() {
    this.initBoard();
  }

  cells(): number[] {
    return this.board.reduce<number[]>((acc, val) => ([...acc, ...val]), []);
  }

  selectMarble(evt: MouseEvent, index: number, value: number): boolean {
    if (value < 0) {
      evt.preventDefault();
      return false;
    }

    const { row: prevRow, col: prevCol } = this.getRowCol(this.selectedIndex);
    const { row, col } = this.getRowCol(index);


    if (this.isSwapable(value, row, col, prevRow, prevCol)) {
      this.moveMarble(row, col, prevRow, prevCol);
      if (!this.gameStarted) {
        this.gameStarted = true;
      }
    } else {
      this.selectedIndex = index;
    }
  }

  startNewGame(evt: MouseEvent): void {
    this.initBoard();
  }

  private initBoard(): void {
    this.board = [
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, 1, 1, 1, 1, 1, -1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [-1, 1, 1, 1, 1, 1, -1],
      [-1, -1, 1, 1, 1, -1, -1]
    ];
    this.gameStarted = false;
    this.gameEndMarbleCount = 0;
    this.gameEnd = false;
    this.selectedIndex = 10;
    this.playingFeedback = '';
  }

  private moveMarble(row: number, col: number, prevRow: number, prevCol: number): void {
    let middleCol;
    let middleRow;

    if (prevCol === col) {
      middleCol = col;
      middleRow = (prevRow === row) ? row : (prevRow > row ? prevRow - 1 : prevRow + 1);
    } else if (prevRow === row) {
      middleRow = row;
      middleCol = (prevCol === col) ? col : (prevCol > col ? prevCol - 1 : prevCol + 1);
    }

    this.board[prevRow][prevCol] = 0;
    this.board[middleRow][middleCol] = 0;
    this.board[row][col] = 1;
    this.gameEnd = this.isGameOver();

    if (this.gameEnd) {
      this.postEndGame();
    }
  }

  private postEndGame(): void {
    this.gameEndMarbleCount = this.board.reduce<number>((acc, subarr) => {
      acc += subarr.filter((val) => (val === 1)).length;
      return acc;
    }, 0);

    if (this.gameEndMarbleCount === 1) {
      this.playingFeedback = 'You are Champion';
    } else if (this.gameEndMarbleCount > 1 && this.gameEndMarbleCount <= 3) {
      this.playingFeedback = 'You are Genious';
    } else if (this.gameEndMarbleCount > 4 && this.gameEndMarbleCount <= 6) {
      this.playingFeedback = 'Good, Need Improvement';
    } else {
      this.playingFeedback = 'Need More Practice';
    }
  }

  private getRowCol(index: number): Cell {
    const row: number = Math.floor(index / BOARD.MAX_ROW);
    const col: number = index % BOARD.MAX_COL;

    return { col, row };
  }

  private isGameOver(): boolean {
    for (let rowIndex = 0; rowIndex < BOARD.MAX_ROW; rowIndex++) {
      for (let colIndex = 0; colIndex < BOARD.MAX_COL; colIndex++) {
        if (this.board[rowIndex][colIndex] === 1 && this.getAvilableHoles(rowIndex, colIndex).length > 0) {
          return false;
        }
      }
    }

    return true;
  }

  private isCellExists(rowIndex: number, colIndex: number): boolean {
    try {
      const val = this.board[rowIndex][colIndex];
      return true;
    } catch (e){
      return false;
    }
  }

  private getAvilableHoles(rowIndex: number, colIndex: number): Cell[] {
    const holes = [];

    if (this.isCellExists(rowIndex, colIndex - 2) && this.board[rowIndex][colIndex - 2] === 0 && this.board[rowIndex][colIndex - 1] === 1) {
      holes.push({rowIndex, colIndex: colIndex - 2 });
    }

    if (this.isCellExists(rowIndex, colIndex + 2) && this.board[rowIndex][colIndex + 2] === 0 && this.board[rowIndex][colIndex + 1] === 1) {
      holes.push({rowIndex, colIndex: colIndex + 2 });
    }

    if (this.isCellExists(rowIndex - 2, colIndex) && this.board[rowIndex - 2][colIndex] === 0 && this.board[rowIndex - 1][colIndex] === 1) {
      holes.push({rowIndex: rowIndex - 2, colIndex });
    }

    if (this.isCellExists(rowIndex + 2, colIndex) && this.board[rowIndex + 2][colIndex] === 0 && this.board[rowIndex + 1][colIndex] === 1) {
      holes.push({rowIndex: rowIndex + 2, colIndex });
    }

    return holes;
  }

  private isSwapable(value: number, row: number, col: number, prevRow: number, prevCol: number): boolean {
    return (Math.abs(row - prevRow) === 2 || Math.abs(col - prevCol) === 2) && value === 0;
  }

}
