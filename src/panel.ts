import Box, { type Direction } from "./box";
import * as T from "three";

export default class Panel extends T.Group {
  private _quantity: number;
  private _direction: Direction;
  private _boxes: Box[] = [];

  constructor(quantity: number, direction: Direction) {
    super();
    this._quantity = quantity;
    this._direction = direction;
    this.setup();
  }

  setup() {
    for (let i = 0; i < this._quantity / 2; ++i) {
      const box = new Box({
        scale: 2,
        color: 0xff00000,
        transitionColor: 0x0000ff,
        direction: this._direction,
        position: new T.Vector3(0, -i, 0),
      });
      this.add(box.element);
      this._boxes.push(box);
    }
  }

  animateBoxes(fft: Uint8Array<ArrayBufferLike>) {
    this._boxes.forEach((box, i) => {
      box.animate(fft[i]);
    });
  }
}
