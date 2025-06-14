import * as T from "three";
import Box from "./box";
import ThemeManager, { type Direction } from "./themeManager";

export default class Panel extends T.Group {
  private _quantity: number;
  private _direction: Direction;
  private _boxes: Box[] = [];

  constructor(quantity: number, direction: Direction) {
    super();
    this._quantity = quantity / 2;
    this._direction = direction;
    this.setup();
  }

  setup() {
    const theme = ThemeManager.getTheme();
    if (theme) {
      theme.setDirection(this._direction);
      for (let i = 0; i < this._quantity; ++i) {
        const angle = theme.calculateAngle(i, this._quantity);
        const box = new Box({
          color: theme.ThemeObject.color,
          transitionColor: theme.ThemeObject.transitionColor,
          direction: theme.ThemeObject.direction,
          position: theme.calculatePosition(i, 250, (angle * Math.PI) / 180),
          rotation: angle,
        });
        this.add(box.element);
        this._boxes.push(box);
      }
    }
  }

  animateBoxes(fft: Uint8Array<ArrayBufferLike>) {
    this._boxes.forEach((box, i) => {
      box.animate(fft[i]);
    });
  }
}
