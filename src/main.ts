import './css/styles.css';
import { Game } from './engine/game';
import { HTMLRender } from './render';
import './theme';

const game = new Game();
const htmlRender = new HTMLRender();
game.subscribe(htmlRender);

const cells = document.querySelectorAll<HTMLElement>('.cell');

const handleCellClick = (ev: MouseEvent): void => {
  const cell = ev.currentTarget as HTMLElement;
  const index = Number(cell.dataset.index);
  game.play(index);
};

for (const cell of cells) {
  cell.addEventListener("click", handleCellClick);
}

const resetButton = document.querySelector<HTMLButtonElement>("#reset-button") as HTMLButtonElement;
resetButton.addEventListener("click", () => {
  game.reset();
})


