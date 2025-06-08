import * as T from "three";
import gsap from "gsap";

export type Direction = "x" | "y" | "z";

type BoxType = {
  scale?: number;
  transitionColor?: number;
  position?: T.Vector3;
  color?: number;
  direction?: Direction;
};

export default class Box {
  private _color: number = 0;
  private _position: T.Vector3;
  private _direction: Direction;
  private _el: T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;

  constructor({
    color = 0xffffff,
    position = new T.Vector3(0, 0, 0),
    direction = "x",
  }: BoxType) {
    this._color = color;
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
    this._el.scale[this._direction] = scalar;
    this._el.position[this._direction] = -scalar / 2;
  }
}
