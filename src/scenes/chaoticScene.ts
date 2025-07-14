import * as T from "three";
import CustomScene from "../customScene";
import type { Schema, Theme } from "../types";
import { useLocalStorage } from "../utils/utils";

const SCENE_NAME = "ChaoticScene";

const INPUT_IDS = {
  boxSizeInput: "BoxSizeInput",
  RotationSpeedInput: "RotationSpeedInput",
};

const DEFAULT_VALUES = {
  boxSize: useLocalStorage<number>(SCENE_NAME + INPUT_IDS.boxSizeInput, 1),
  rotationSpeed: useLocalStorage<number>(SCENE_NAME + INPUT_IDS.RotationSpeedInput, 100),
};

const DEFAULT_SCHEMAS: Schema[] = [
  {
    id: INPUT_IDS.boxSizeInput,
    localStorageId: SCENE_NAME + INPUT_IDS.boxSizeInput,
    name: "boxSize",
    type: "number",
    defaultValue: DEFAULT_VALUES.boxSize.value,
    required: true,
    order: 1,
    textContent: "Box Size: ",
    minValue: 0,
    eventProvider: (groups: T.Group[]) => {
      return (e: Event) => {
        const { value } = DEFAULT_VALUES.boxSize.set(parseFloat((e.target as HTMLInputElement).value));
        for (const group of groups) {
          for (let i = 0; i < group.children.length; ++i) {
            const box = group.children[i] as T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;
            box.scale.set(value, value, value);
          }
        }
      };
    },
    eventHandler: () => {},
  },
  {
    id: INPUT_IDS.RotationSpeedInput,
    localStorageId: SCENE_NAME + INPUT_IDS.RotationSpeedInput,
    name: "rotationSpeed",
    type: "number",
    defaultValue: DEFAULT_VALUES.rotationSpeed.value,
    required: true,
    order: 2,
    textContent: "Rotation Speed: ",
    minValue: 1,
    eventProvider: (_) => {
      return (e: Event) => {
        const { value } = DEFAULT_VALUES.rotationSpeed.set(parseInt((e.target as HTMLInputElement).value));
        DEFAULT_VALUES.rotationSpeed.value = value;
      };
    },
    eventHandler: () => {},
  },
];

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
        const boxGeometry = new T.BoxGeometry(1, 1, 1);
        const boxMaterial = new T.MeshBasicMaterial({
          color: this.currentTheme.color,
        });
        const boxMesh = new T.Mesh(boxGeometry, boxMaterial);

        const position = new T.Vector3(Math.cos((angle * Math.PI) / 180) * 250, Math.sin((angle * Math.PI) / 180) * 250, i);

        boxMesh.position.copy(position);
        boxMesh.rotation.z = angle;
        boxMesh.scale.set(DEFAULT_VALUES.boxSize.value, DEFAULT_VALUES.boxSize.value, DEFAULT_VALUES.boxSize.value);

        this._groups[j].add(boxMesh);
      }
    }
  }

  animate(fft: Uint8Array<ArrayBufferLike>, delta: number): void {
    this.background = this.currentTheme.backgroundColor;
    this.rotation.z = -delta / DEFAULT_VALUES.rotationSpeed.value;
    for (const group of this._groups) {
      for (let i = 0; i < group.children.length; ++i) {
        const box = group.children[i] as T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;
        const scalar = fft[i];
        box.scale.y = Math.max(scalar / 2, 1);
        box.material.color.lerpColors(this.currentTheme.color, this.currentTheme.transitionColor, Math.abs(scalar) / this.maxScalar || 1);
      }
    }
    this.maxScalar = fft[0];
  }

  scheme(): Schema[] {
    return DEFAULT_SCHEMAS.map((schema) => ({ ...schema, eventHandler: schema.eventProvider(this._groups) }));
  }
}
