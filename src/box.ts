import * as T from "three";

export type Direction = "x" | "y" | "z";

type BoxType = {
  transitionColor?: T.Color;
  position?: T.Vector3;
  color?: T.Color;
  direction?: Direction;
};

export default class Box {
  private _transitionColor: T.Color;
  private _color: T.Color;
  private _position: T.Vector3;
  private _direction: Direction;
  private _el: T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;

  constructor({
    transitionColor = new T.Color(0xff0000),
    color = new T.Color(0xffffff),
    position = new T.Vector3(0, 0, 0),
    direction = "x",
  }: BoxType) {
    this._color = color;
    this._transitionColor = transitionColor;
    this._position = position;
    this._direction = direction;
    this._el = this.create();
  }

  get element() {
    return this._el;
  }

  create() {
    const boxGeometry = new T.BoxGeometry(1, 1, 1);
    const boxMaterial = new T.MeshBasicMaterial({ color: this._color });
    const boxMesh = new T.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.copy(this._position);
    return boxMesh;
  }

  animate(scalar: number) {
    if (this._direction === "y") {
      scalar *= -1;
    }

    this._el.scale[this._direction] = scalar;
    this._el.position[this._direction] = -scalar / 2;
    this._el.material.color.lerpColors(
      this._color,
      this._transitionColor,
      Math.abs(scalar) / 195
    );
  }
}
