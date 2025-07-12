import * as T from "three";
import { type Schema, type Theme } from "./types";

export default class CustomScene extends T.Scene {
  public numberOfFrequencies: number;
  public quantity: number;
  public currentThemeIndex: number;
  public themes: Theme[] = [];
  public inputs: HTMLInputElement[];

  constructor(numberOfFrequencies: number, themes: Theme[], currentThemeIndex: number) {
    super();
    this.numberOfFrequencies = numberOfFrequencies;
    this.themes = themes;
    this.quantity = numberOfFrequencies / 2;
    this.currentThemeIndex = currentThemeIndex;
    this.inputs = [];
  }

  setup() {}

  scheme(): Schema[] | never[] {
    return [];
  }

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
