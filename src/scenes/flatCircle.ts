import * as T from "three";
import CustomScene from "../customScene";
import type { Schema, Theme } from "../types";
import { useLocalStorage } from "../utils/utils";

const SCENE_NAME = "FlatCircleScene";

const INPUT_IDS = {
  FlatCircleRadius: "FlatCircleRadius",
};

const DEFAULT_VALUES = {
  radius: useLocalStorage<number>(SCENE_NAME + INPUT_IDS.FlatCircleRadius, 250),
};

const DEFAULT_SCHEMAS: Schema[] = [
  {
    id: INPUT_IDS.FlatCircleRadius,
    localStorageId: SCENE_NAME + INPUT_IDS.FlatCircleRadius,
    name: "Radius",
    textContent: "Radius: ",
    defaultValue: DEFAULT_VALUES.radius.value,
    order: 1,
    required: true,
    type: "number",
    minValue: "1",
    eventProvider: (groups: T.Group[]) => {
      return (e: Event) => {
        const { value } = DEFAULT_VALUES.radius.set(parseInt((e.target as HTMLInputElement).value));

        for (let j = 0; j < groups.length; ++j) {
          for (let i = 0; i < groups[j].children.length; ++i) {
            const factor = j % groups.length === 0 ? -1 : 1;
            const angle = factor * i * ((Math.PI * 2) / groups[j].children.length);
            const position = new T.Vector3(Math.cos(angle) * value, Math.sin(angle) * value, 0);
            groups[j].children[i].position.copy(position);
          }
        }
      };
    },
    eventHandler: () => {},
  },
];

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
          color: this.currentTheme.color,
        });
        const boxMesh = new T.Mesh(boxGeometry, boxMaterial);

        const position = new T.Vector3(Math.cos(angle) * DEFAULT_VALUES.radius.value, Math.sin(angle) * DEFAULT_VALUES.radius.value, 0);

        boxMesh.position.copy(position);
        boxMesh.rotation.z = angle;
        boxMesh.geometry.translate(factor * 0.5, 0.0, 0);
        this._groups[j].add(boxMesh);
      }
    }
  }

  animate(fft: Uint8Array<ArrayBufferLike>): void {
    this.background = this.currentTheme.backgroundColor;
    for (const group of this._groups) {
      for (let i = 0; i < group.children.length; ++i) {
        const box = group.children[i] as T.Mesh<T.BoxGeometry, T.MeshBasicMaterial, T.Object3DEventMap>;
        const scalar = fft[i];
        box.scale.x = Math.max(scalar, 1);
        box.material.color.lerpColors(this.currentTheme.color, this.currentTheme.transitionColor, Math.abs(scalar) / 195);
      }
    }
  }

  scheme(): Schema[] {
    return DEFAULT_SCHEMAS.map((schema) => ({ ...schema, eventHandler: schema.eventProvider(this._groups) }));
  }
}
