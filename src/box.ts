import * as T from "three";
import gsap from "gsap";

type BoxType = {
  scale?: number;
  transitionColor?: number;
  position?: number[];
  color?: number;
};

export class Box {
  private _transitionColor: number = 0;
  private _scale = 0;
  private _color: number = 0;
  private _position: number[] = [];
  private _el: T.Mesh<
    T.BoxGeometry,
    T.MeshStandardMaterial,
    T.Object3DEventMap
  >;

  constructor({
    scale = 1,
    transitionColor = 0xffffff,
    color = 0xffffff,
    position = [0, 0, 0],
  }: BoxType) {
    this._scale = scale;
    this._transitionColor = transitionColor;
    this._color = color;
    this._position = position;
    this._el = this.create();
  }

  get element() {
    return this._el;
  }

  create() {
    const boxGeometry = new T.BoxGeometry(1, 1, 1);
    const boxMaterial = new T.MeshStandardMaterial({ color: this._color });
    const boxMesh = new T.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(
      this._position[0],
      this._position[1],
      this._position[2]
    );
    return boxMesh;
  }

  animate(triggered: boolean) {
    const scale = triggered ? { x: 1 } : { x: this._scale };
    const position = triggered ? { x: 0 } : { x: -0.5 };
    const color = triggered ? this._color : this._transitionColor;

    gsap.to(this._el.scale, scale);
    gsap.to(this._el.position, position);
    gsap.to(this._el.material.color, new T.Color(color));
  }
}
