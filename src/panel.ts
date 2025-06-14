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
      const angle = i * (this._quantity / 2 / (180 * 2));
      // const angle = ((i * this._quantity) / Math.PI) * 2;
      const box = new Box({
        color: new T.Color(0xffffff),
        transitionColor: new T.Color(0x0000ff),
        direction: this._direction,
        // position: this.createPositionVector(this._direction, i),
        position: this.createPositionVectorRotated(
          i,
          250,
          angle * (Math.PI / 180)
        ),
        rotation: angle,
      });
      this.add(box.element);
      this._boxes.push(box);
    }
  }

  createPositionVectorRotated(i: number, radius: number, angle: number) {
    const x = Math.floor(Math.cos(angle) * radius);
    const y = Math.floor(Math.sin(angle) * radius);
    const z = i;
    return new T.Vector3(x, y, z);
  }

  createPositionVector(direction: Direction, i: number): T.Vector3 {
    if (direction === "x") {
      return new T.Vector3(0, -i, 0);
    }
    if (direction === "y") {
      return new T.Vector3(-i, 0, 0);
    }
    if (direction === "z") {
      return new T.Vector3(-i, -i, 0);
    }
    return new T.Vector3(0, 0, 0);
  }

  animateBoxes(fft: Uint8Array<ArrayBufferLike>) {
    this._boxes.forEach((box, i) => {
      box.animate(fft[i]);
    });
  }
}
