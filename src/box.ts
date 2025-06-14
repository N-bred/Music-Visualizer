import * as T from "three";

export type Direction = "x" | "y" | "z";

type BoxType = {
  transitionColor?: T.Color;
  position?: T.Vector3;
  color?: T.Color;
  direction?: Direction;
  rotation?: number;
};

export default class Box {
  private _transitionColor: T.Color;
  private _color: T.Color;
  private _position: T.Vector3;
  private _direction: Direction;
  private _rotation: number;
  private _el: T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;

  constructor({
    transitionColor = new T.Color(0xff0000),
    color = new T.Color(0xffffff),
    position = new T.Vector3(0, 0, 0),
    direction = "x",
    rotation = 0,
  }: BoxType) {
    this._color = color;
    this._transitionColor = transitionColor;
    this._position = position;
    this._direction = direction;
    this._rotation = rotation;
    this._el = this.create();
  }

  get element() {
    return this._el;
  }

  create() {
    const boxGeometry = new T.BoxGeometry(1, 1, 1);
    // boxGeometry.translate(0,0,0.5);
    const boxMaterial = new T.MeshBasicMaterial({ color: this._color });
    const boxMesh = new T.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.copy(this._position);
    // boxMesh.lookAt(new T.Vector3(0,0,this._position.z));
    boxMesh.rotation.z = this._rotation;
    return boxMesh;
  }

  animate(scalar: number) {
    this._el.scale.y = Math.max(scalar, 1);
    this._el.material.color.lerpColors(
      this._color,
      this._transitionColor,
      Math.abs(scalar) / 195
    );
  }
}
