import * as T from "three";

export default class VisualizerScene extends T.Scene {
  constructor() {
    super();
    this.background = new T.Color(0x000000);
  }

  instantiateBox(color: T.Color = new T.Color(0xffffff)) {
    const boxGeometry = new T.BoxGeometry(1, 1, 1);
    const boxMaterial = new T.MeshBasicMaterial({ color });
    const boxMesh = new T.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(0, 0, 0);

    this.add(boxMesh);
  }

  instantiateLight(
    color: T.Color = new T.Color(0xffffff),
    intensity: number = 1
  ) {
    const light = new T.DirectionalLight(color, intensity);
    this.add(light);
  }
}
