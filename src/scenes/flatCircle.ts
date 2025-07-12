import * as T from "three";
import CustomScene from "../customScene";
import type { Theme } from "../types";
import { disposeObject } from "../utils/utils";

export default class FlatCircleScene extends CustomScene {
  private _groups: T.Group[] = [];
  private numberOfGroups: number;

  constructor(numberOfFrequencies: number, themes: Theme[], currentThemeIndex: number) {
    super(numberOfFrequencies, themes, currentThemeIndex);
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
          color: this.themes[this.currentThemeIndex].color,
        });
        const boxMesh = new T.Mesh(boxGeometry, boxMaterial);

        const position = new T.Vector3(Math.cos(angle) * 250, Math.sin(angle) * 250, 0);

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
        const box = group.children[i] as T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;
        const scalar = fft[i];
        box.scale.x = Math.max(scalar, 1);
        box.material.color.lerpColors(
          this.themes[this.currentThemeIndex].color,
          this.themes[this.currentThemeIndex].transitionColor,
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
