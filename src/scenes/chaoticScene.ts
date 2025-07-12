import * as T from "three";
import CustomScene from "../customScene";
import type { Schema, Theme } from "../types";
import { disposeObject } from "../utils/utils";

const DEFAULT_VALUES = {
  boxSize: 1,
  rotationSpeed: 100,
};

export default class ChaoticScene extends CustomScene {
  private _groups: T.Group[] = [];
  private numberOfGroups: number;
  private maxScalar: number;

  constructor(numberOfFrequencies: number, themes: Theme[], currentThemeIndex: number) {
    super(numberOfFrequencies, themes, currentThemeIndex);
    this.numberOfGroups = 2;
    this.maxScalar = 0;
    this.setup();
  }

  setup(): void {
    for (let i = 0; i < this.numberOfGroups; ++i) {
      const group = new T.Group();
      group.position.z = i * 10;
      group.rotation.z = 2 * i * (Math.PI / 2);
      this.add(group);
      this._groups.push(group);
    }

    for (let j = 0; j < this.numberOfGroups; ++j) {
      for (let i = 0; i < this.quantity; ++i) {
        const angle = i * (this.quantity / (2 * 180));
        const boxGeometry = new T.BoxGeometry(DEFAULT_VALUES.boxSize);
        const boxMaterial = new T.MeshBasicMaterial({
          color: this.themes[this.currentThemeIndex].color,
        });
        const boxMesh = new T.Mesh(boxGeometry, boxMaterial);

        const position = new T.Vector3(Math.cos((angle * Math.PI) / 180) * 250, Math.sin((angle * Math.PI) / 180) * 250, i);

        boxMesh.position.copy(position);
        boxMesh.rotation.z = angle;

        this._groups[j].add(boxMesh);
      }
    }
  }

  animate(fft: Uint8Array<ArrayBufferLike>, delta: number): void {
    this.background = this.themes[this.currentThemeIndex].backgroundColor;
    this.rotation.z = -delta / DEFAULT_VALUES.rotationSpeed;
    for (const group of this._groups) {
      for (let i = 0; i < group.children.length; ++i) {
        const box = group.children[i] as T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;
        const scalar = fft[i];
        box.scale.y = Math.max(scalar / 2, 1);
        box.material.color.lerpColors(
          this.themes[this.currentThemeIndex].color,
          this.themes[this.currentThemeIndex].transitionColor,
          Math.abs(scalar) / this.maxScalar || 1
        );
      }
    }
    this.maxScalar = fft[0];
  }

  destroy(): void {
    for (const group of this._groups) {
      for (let i = 0; i < group.children.length; ++i) {
        disposeObject(group.children[i]);
      }
    }
    this._groups = [];
  }

  handleNewBoxSize(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);

    for (const group of this._groups) {
      for (let i = 0; i < group.children.length; ++i) {
        const box = group.children[i] as T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;
        box.scale.set(value, value, value);
      }
    }
  }

  scheme(): Schema[] {
    return [
      {
        name: "boxSize",
        type: "number",
        defaultValue: DEFAULT_VALUES.boxSize.toString(),
        required: true,
        order: 1,
        textContent: "Box Size: ",
        minValue: "0",
        onChange: (e) => this.handleNewBoxSize(e),
      },
      {
        name: "rotationSpeed",
        type: "number",
        defaultValue: DEFAULT_VALUES.rotationSpeed.toString(),
        required: true,
        order: 2,
        textContent: "Rotation Speed: ",
        minValue: "1",
        onChange: (e) => {
          DEFAULT_VALUES.rotationSpeed = parseInt((e.target as HTMLInputElement).value);
        },
      },
    ];
  }
}
