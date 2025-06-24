import * as T from "three";
import CustomScene from "../customScene";

export default class ChaoticScene extends CustomScene {
  private _groups: T.Group[] = [];
  private numberOfGroups: number;
  private quantity: number;
  private color: T.Color;
  private transitionColor: T.Color;

  constructor(numberOfFrequencies: number) {
    super(numberOfFrequencies);
    this.numberOfGroups = 2;
    this.quantity = numberOfFrequencies / 2;
    this.color = new T.Color(0x2607a6);
    this.transitionColor = new T.Color(0x5500ff);
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
        const boxMaterial = new T.MeshBasicMaterial({ color: this.color });
        const boxMesh = new T.Mesh(boxGeometry, boxMaterial);

        const position = new T.Vector3(
          Math.cos((angle * Math.PI) / 180) * 250,
          Math.sin((angle * Math.PI) / 180) * 250,
          i
        );

        boxMesh.position.copy(position);
        boxMesh.rotation.z = angle;

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
        box.scale.y = Math.max(scalar, 1);
        box.material.color.lerpColors(
          this.color,
          this.transitionColor,
          Math.abs(scalar) / 195
        );
      }
    }
  }
}
