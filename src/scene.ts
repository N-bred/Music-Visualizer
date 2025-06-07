import * as T from "three";
import gsap from "gsap";

export default class VisualizerScene extends T.Scene {
  private triggered = false;
  constructor() {
    super();
    this.background = new T.Color(0x000000);
  }

  instantiateBox(color: T.Color = new T.Color(0xffffff)) {
    const boxGeometry = new T.BoxGeometry(1, 1, 1);
    const boxMaterial = new T.MeshStandardMaterial({ color });
    const boxMesh = new T.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(0, 0, 0);
    this.add(boxMesh);
  }

  instantiateLight(
    color: T.Color = new T.Color(0xffffff),
    intensity: number = 1
  ) {
    const light = new T.DirectionalLight(color, intensity);
    light.position.set(5, 5, -10);
    light.target.position.set(0, 0, 0);

    this.add(light);
  }

  animateBox() {
    this.children.forEach((c) => {
      if (c.type === "Mesh") {
        const child = c as T.Mesh<
          T.BoxGeometry,
          T.MeshStandardMaterial,
          T.Object3DEventMap
        >;
        
        const scale = this.triggered ? { x: 1 } : { x: 2 };
        const position = this.triggered ? { x: 0 } : { x: -0.5 };
        const color = this.triggered ? 0xffffff : 0x000000;

        gsap.to(child.scale, scale);
        gsap.to(child.position, position);
        gsap.to(child.material.color, new T.Color(color));
        this.triggered = !this.triggered;
      }
    });
  }
}
