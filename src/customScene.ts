import * as T from "three";
import { type Schema, type Theme } from "./types";
import { stateChangedEvent } from "./Events";

export default class CustomScene extends T.Scene {
  public numberOfFrequencies: number;
  public quantity: number;
  public currentThemeIndex: number;
  public themes: Theme[] = [];
  public inputs: HTMLInputElement[];
  public currentTheme: Theme;

  constructor(numberOfFrequencies: number, themes: Theme[], currentThemeIndex: number) {
    super();
    this.numberOfFrequencies = numberOfFrequencies;
    this.themes = themes;
    this.quantity = numberOfFrequencies / 2;
    this.currentThemeIndex = currentThemeIndex;
    this.currentTheme = themes[currentThemeIndex];
    this.inputs = [];

    window.addEventListener(stateChangedEvent, (e: CustomEventInit) => {
      this.themes = e.detail.themes;
    });
  }

  setup() {}

  scheme(): Schema[] | never[] {
    return [];
  }

  changeTheme(themeIndex: number) {
    this.currentThemeIndex = themeIndex;
    this.currentTheme = this.themes[themeIndex];
  }

  animate(fft: Uint8Array<ArrayBufferLike>, delta?: number) {
    console.log(fft);
    console.log(delta);
    return;
  }
}
