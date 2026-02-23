import type { Observer } from "./core/observer";
import type { State } from "./engine/game_state";
import { Player } from "./engine/player";

export class HTMLRender implements Observer {
  private readonly cells: HTMLElement[];
  private readonly boards: HTMLElement[];
  private readonly statusElement: HTMLElement;
  private readonly alertElement: HTMLElement;

  constructor() {
    this.cells = this.getElements<HTMLElement>(".cell");
    this.boards = this.getElements<HTMLElement>(".board");
    this.statusElement = this.getElementById("status");
    this.alertElement = this.getElementById("alert");
  }

  public update(state: State): void {
    this.render(state);
  }

  private render(state: State): void {
    this.renderCells(state);
    this.renderBoards(state);
    this.renderActiveBoard(state);
    this.renderStatus(state);
  }

  private renderCells(state: State): void {
    for (const cell of this.cells) {
      const index = this.getCellIndex(cell);
      const { mainIndex, tinyIndex } = this.mapCellIndex(index);
      const value = state.tinyBoard[mainIndex][tinyIndex] as Player | null;

      this.resetCell(cell);

      if (!value) continue;

      cell.textContent = value;
      cell.classList.add(this.playerClass(value));
    }
  }

  private renderBoards(state: State): void {
    this.boards.forEach((board, index) => {
      const winner = state.mainBoard[index] as Player | null;

      board.classList.remove("won", "x", "o");

      if (!winner) return;

      board.classList.add("won", this.playerClass(winner));
    });
  }

  private renderActiveBoard(state: State): void {
    this.boards.forEach((board, index) => {
      const isActive =
        !state.allowAnyBoard && index === state.activeBoard;

      board.classList.toggle("active", isActive);
    });
  }

  private renderStatus(state: State): void {
    const winner = state.winner as Player | null;

    if (winner) {
      this.openWinnerModal(winner);
      return;
    }

    const currentPlayerRender = this.buildCurrentPlayerMarkup(state.currentPlayer as Player);
    const allowAnyBoardRender = this.buildAllowAllBoardRender(state.allowAnyBoard);

    this.statusElement.innerHTML = currentPlayerRender;
    this.alertElement.innerHTML = allowAnyBoardRender;
  }

  private openWinnerModal(winner: Player): void {
    this.removeExistingModal();

    const modal = this.createModal(winner);
    document.body.appendChild(modal);
  }

  private createModal(winner: Player): HTMLElement {
    const modal = document.createElement("div");
    modal.className = "winner-modal";

    modal.innerHTML = `
      <div class="winner-backdrop"></div>
      <div class="winner-content">
        <h2>🏆 Winner</h2>
        <div class="winner-player ${this.playerClass(winner)}">
          ${winner}
        </div>
        <button class="winner-button">Play Again</button>
      </div>
    `;

    modal
      .querySelector<HTMLButtonElement>(".winner-button")
      ?.addEventListener("click", () => {
        modal.remove();
        window.location.reload();
      });

    return modal;
  }

  private buildAllowAllBoardRender(allowAnyBoard: boolean) {
    if (allowAnyBoard) {
      return `
        <div class="alert-info">
          <div class="alert-icon"> ✓ </div>
          <div class="alert-content">
            <p class="alert-description">
              The current player can choose any board!
            </p>
          </div>
        </div>
      `
    }

    return "";
  }

  private buildCurrentPlayerMarkup(player: Player): string {
    return `
      <span class="status-label">Current Player</span>
      <span class="status-player ${this.playerClass(player)}">
        ${player}
      </span>
    `;
  }

  private playerClass(player: Player): string {
    return player === Player.X ? "x" : "o";
  }

  private resetCell(cell: HTMLElement): void {
    cell.classList.remove("x", "o");
    cell.textContent = "";
  }

  private mapCellIndex(index: number) {
    return {
      mainIndex: Math.trunc(index / 9),
      tinyIndex: index % 9,
    };
  }

  private getCellIndex(cell: HTMLElement): number {
    return Number(cell.dataset.index);
  }

  private removeExistingModal(): void {
    document.querySelector(".winner-modal")?.remove();
  }

  private getElements<T extends HTMLElement>(selector: string): T[] {
    return Array.from(document.querySelectorAll<T>(selector));
  }

  private getElementById(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id "${id}" not found.`);
    }
    return element;
  }
}