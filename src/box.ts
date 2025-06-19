import * as T from "three";
import ThemeManager, { type BoxType } from "./themeManager";

export default class Box {
  private _transitionColor: BoxType["transitionColor"];
  private _color: BoxType["color"];
  private _position: BoxType["position"];
  private _rotation: BoxType["rotation"];
  private _direction: BoxType["direction"];
  private _theme: ThemeManager;
  private _el: T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;

  constructor({
    transitionColor = new T.Color(0xff0000),
    color = new T.Color(0xffffff),
    position = new T.Vector3(0, 0, 0),
    rotation = 0,
    direction = "x",
  }: BoxType) {
    this._color = color;
    this._transitionColor = transitionColor;
    this._position = position;
    this._rotation = rotation;
    this._direction = direction;
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
      // boxMesh.lookAt(new T.Vector3(0, 0, window.camera.position.z || 0));
    } else {
      boxGeometry.translate(0, 0.5, 0);
      // boxMesh.lookAt(new T.Vector3(0, 0, this._position.z));
      boxMesh.lookAt(new T.Vector3(0, 0, 1));
    }

    return boxMesh;
  }

  animate(scalar: number) {
    this._el.scale[this._direction] = Math.max(scalar, 1);
    this._el.material.color.lerpColors(
      this._color,
      this._transitionColor,
      Math.abs(scalar) / 195
    );
  }
}
