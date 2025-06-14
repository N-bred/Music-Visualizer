import * as T from "three";
import Panel from "./panel";
import { type Direction } from "./themeManager";

export default class VisualizerScene extends T.Scene {
  private _panels: Panel[] = [];

  constructor() {
    super();
    this.background = new T.Color(0x000000);
  }

  instantiatePanel(quantity: number, direction: Direction) {
    const length = this._panels.length;
    const panel = new Panel(quantity, direction);
    panel.position.z = length * 25;
    panel.rotation.z = 2 * length * (Math.PI / 2);
    this.add(panel);
    this._panels.push(panel);
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

  animatePanel(fft: Uint8Array<ArrayBufferLike>) {
    this._panels.forEach((panel) => {
      panel.animateBoxes(fft);
    });
  }
}
