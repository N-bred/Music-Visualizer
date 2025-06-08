import * as T from "three";

import { Box } from "./box";

export default class VisualizerScene extends T.Scene {
  private _triggered = false;
  private _boxes: Box[] = [];
  constructor() {
    super();
    this.background = new T.Color(0x000000);
  }

  instantiateBox() {
    const box = new Box({scale: 2, color: 0xff00000, transitionColor: 0x0000ff});
    this.add(box.element);
    this._boxes.push(box);
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
    this._boxes.forEach((box) => {
      box.animate(this._triggered);
    });

    this._triggered = !this._triggered;
  }
}
