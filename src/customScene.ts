import * as T from "three";
import { type theme } from "./stateManager";

export default class CustomScene extends T.Scene {
  public numberOfFrequencies: number;
  public quantity: number;
  public currentThemeIndex: number;
  public themes: theme[] = [];

  constructor(numberOfFrequencies: number, themes: theme[], currentThemeIndex: number) {
    super();
    this.numberOfFrequencies = numberOfFrequencies;
    this.themes = themes;
    this.quantity = numberOfFrequencies / 2;
    this.currentThemeIndex = currentThemeIndex;
  }

  setup() {}

  changeTheme(themeIndex: number) {
    this.currentThemeIndex = themeIndex;
    this.changeBackground();
  }

  changeBackground() {
    this.background = this.themes[this.currentThemeIndex].backgroundColor;
  }
  animate(fft: Uint8Array<ArrayBufferLike>) {
    console.log(fft);
    return;
  }

  destroy() {}
}
