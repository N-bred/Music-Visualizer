import * as T from "three";
import ThemeManager, { type BoxType } from "./themeManager";

export default class Box {
  private _transitionColor: T.Color;
  private _color: T.Color;
  private _position: T.Vector3;
  private _rotation: number;
  private _theme: ThemeManager;
  private _el: T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;

  constructor({
    transitionColor = new T.Color(0xff0000),
    color = new T.Color(0xffffff),
    position = new T.Vector3(0, 0, 0),
    rotation = 0,
  }: BoxType) {
    this._color = color;
    this._transitionColor = transitionColor;
    this._position = position;
    this._rotation = rotation;
    this._theme = ThemeManager.getTheme()!;
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

    if (this._theme.ThemeObject.theme === "chaotic") {
      boxMesh.rotation.z = this._rotation;
    } else {
      boxGeometry.translate(0, 0.5, 0);
      boxMesh.lookAt(new T.Vector3(0, 0, this._position.z));
    }

    return boxMesh;
  }

  animate(scalar: number) {
    this._el.scale[this._theme.ThemeObject.direction] = Math.max(scalar, 1);

    this._el.material.color.lerpColors(
      this._color,
      this._transitionColor,
      Math.abs(scalar) / 195
    );
  }
}
