import type { Player } from "./player"

export type Cell = Player | null

export interface State {
  mainBoard: Cell[]
  tinyBoard: Cell[][]
  currentPlayer: Player,
  activeBoard: number,
  allowAnyBoard: boolean,
  winner: Player | null
}