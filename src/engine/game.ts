import { Subject } from "../core/subject";
import type { Cell, State } from "./game_state";
import { Player } from "./player";

export class Game extends Subject {
  private state: State;
  private static BOARD_SIZE = 9;

  private initialState(): State {
    const mainBoard: Cell[] = Array(Game.BOARD_SIZE).fill(null as Cell)
    const tinyBoard: Cell[][] = Array.from(
      { length: Game.BOARD_SIZE },
      () => Array(Game.BOARD_SIZE).fill(null as Cell)
    )

    return {
      mainBoard,
      tinyBoard,
      activeBoard: 4,
      allowAnyBoard: true,
      currentPlayer: Player.X,
      winner: null
    }
  }

  constructor() {
    super();
    this.state = this.initialState()
    this.notify(this.state);
  }

  public reset() {
    this.state = this.initialState()
    this.notify(this.state);
  }

  private calcBoardIndex(number: number): { mainIndex: number; tinyIndex: number } {
    const mainIndex = Math.trunc(number / Game.BOARD_SIZE)
    const tinyIndex = number % Game.BOARD_SIZE;

    return {
      mainIndex,
      tinyIndex
    }
  }

  private checkWinner(board: Cell[]): Player | null {
    // 0 | 1 | 2
    // 3 | 4 | 5
    // 6 | 7 | 8

    const combos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
      [0, 4, 8], [2, 4, 6]             // Diagonais
    ];

    for (const [a, b, c] of combos) {
      const isEquals = board[a] === board[b] && board[a] === board[c];
      const isNotNull = board[a] !== null;

      if (isEquals && isNotNull) {
        return board[a];
      }
    }

    return null;
  }

  private changeCurrentPlayer() {
    const { currentPlayer } = this.state;

    if (currentPlayer === Player.X) { this.state.currentPlayer = Player.O }
    if (currentPlayer === Player.O) { this.state.currentPlayer = Player.X }
  }

  private isPlayable(mainIndex: number, tinyIndex: number) {
    const { activeBoard, allowAnyBoard, tinyBoard, winner, mainBoard } = this.state

    const hasWinner = winner !== null;
    const alreadyMarked = mainBoard[mainIndex] !== null;
    const isInWrongBoard = mainIndex !== activeBoard && !allowAnyBoard;
    const cellIsNotEmpty = tinyBoard[mainIndex][tinyIndex] != null;

    if (isInWrongBoard || cellIsNotEmpty || hasWinner || alreadyMarked) {
      return false
    }

    return true;
  }

  private lockBoardSelection() {
    this.state.allowAnyBoard = false;
  }

  private unlockBoardSelection() {
    this.state.allowAnyBoard = true;
  }

  private markOnBoard(mainIndex: number, tinyIndex: number) {
    const { currentPlayer } = this.state
    this.state.tinyBoard[mainIndex][tinyIndex] = currentPlayer;
  }

  private markMainBoard(index: number) {
    this.state.mainBoard[index] = this.state.currentPlayer;
    this.state.allowAnyBoard = true;
  }

  private resolveMainBoard(mainIndex: number): boolean {
    this.markMainBoard(mainIndex)
    const hasWinner = this.checkWinner(this.state.mainBoard)

    if (hasWinner) {
      this.state.winner = hasWinner;
      this.notify(this.state)
      return true;
    }

    return false
  }

  private handleNewActiveBoard(tinyIndex: number) {
    const { tinyBoard } = this.state;

    const nextBoardIsClosed = this.state.mainBoard[tinyIndex] !== null;
    const tinyBoardIsFull = tinyBoard[tinyIndex].every(cell => cell != null);

    if (nextBoardIsClosed || tinyBoardIsFull) {
      this.unlockBoardSelection();
    } else {
      this.state.activeBoard = tinyIndex;
    }
  }

  private resolveTinyBoard(mainIndex: number, tinyIndex: number): boolean {
    const { tinyBoard } = this.state

    this.lockBoardSelection();
    this.markOnBoard(mainIndex, tinyIndex);

    const hasTinyBoardWinner = this.checkWinner(tinyBoard[mainIndex])

    if (hasTinyBoardWinner) {
      return this.resolveMainBoard(mainIndex);
    }

    this.handleNewActiveBoard(tinyIndex);
    return false;
  }

  public play(index: number) {
    const { mainIndex, tinyIndex } = this.calcBoardIndex(index)

    if (!this.isPlayable(mainIndex, tinyIndex)) return;
    if (this.resolveTinyBoard(mainIndex, tinyIndex)) return;

    this.changeCurrentPlayer()
    this.notify(this.state);
  }
}