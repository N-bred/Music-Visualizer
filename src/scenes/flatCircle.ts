import * as T from "three";
import CustomScene from "../customScene";
import type { theme } from "../customScene";
import { disposeObject } from "../utils";

const DEFAULT_THEMES: theme[] = [
  {
    name: "Purple",
    color: new T.Color(0x2607a6),
    transitionColor: new T.Color(0x5500ff),
  },
  {
    name: "Pink",
    color: new T.Color(0xff00ff),
    transitionColor: new T.Color(0x00ff00),
  },
];

export default class FlatCircleScene extends CustomScene {
  private _groups: T.Group[] = [];
  private numberOfGroups: number;

  constructor(numberOfFrequencies: number, themes: theme[] = DEFAULT_THEMES) {
    super(numberOfFrequencies, themes);
    this.numberOfGroups = 2;
    this.setup();
  }

  setup(): void {
    for (let i = 0; i < this.numberOfGroups; ++i) {
      const group = new T.Group();

      this.add(group);
      this._groups.push(group);
    }

    for (let j = 0; j < this.numberOfGroups; ++j) {
      for (let i = 0; i < this.quantity; ++i) {
        const factor = j % this.numberOfGroups === 0 ? -1 : 1;
        const angle = factor * i * ((Math.PI * 2) / this.quantity);

        const boxGeometry = new T.BoxGeometry(1, 1, 1);
        const boxMaterial = new T.MeshBasicMaterial({
          color: this.themes[this.currentTheme].color,
        });
        const boxMesh = new T.Mesh(boxGeometry, boxMaterial);

        const position = new T.Vector3(
          Math.cos(angle) * 250,
          Math.sin(angle) * 250,
          0
        );

        boxMesh.position.copy(position);
        boxMesh.rotation.z = angle;
        boxMesh.geometry.translate(factor * 0.5, 0.0, 0);
        this._groups[j].add(boxMesh);
      }
    }
  }

  animate(fft: Uint8Array<ArrayBufferLike>): void {
    for (const group of this._groups) {
      for (let i = 0; i < group.children.length; ++i) {
        const box = group.children[i] as T.Mesh<
          T.BoxGeometry,
          T.MeshBasicMaterial,
          T.Object3DEventMap
        >;
        const scalar = fft[i];
        box.scale.x = Math.max(scalar, 1);
        box.material.color.lerpColors(
          this.themes[this.currentTheme].color,
          this.themes[this.currentTheme].transitionColor,
          Math.abs(scalar) / 195
        );
      }
    }
  }

  destroy(): void {
    for (const group of this._groups) {
      for (let i = 0; i < group.children.length; ++i) {
        disposeObject(group.children[i]);
      }
    }
    this._groups = [];
  }
}
