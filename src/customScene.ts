import * as T from "three";

export type theme = {
  name: string;
  color: T.Color;
  transitionColor: T.Color;
};

export default class CustomScene extends T.Scene {
  public numberOfFrequencies: number;
  public quantity: number;
  public currentTheme = 0;
  public themes: theme[] = [];

  constructor(numberOfFrequencies: number, themes: theme[] = []) {
    super();
    this.numberOfFrequencies = numberOfFrequencies;
    this.themes = themes;
    this.quantity = numberOfFrequencies / 2;
  }

  setup() {}

  changeTheme(themeIndex: number) {
    this.currentTheme = themeIndex;
  }

  animate(fft: Uint8Array<ArrayBufferLike>) {
    console.log(fft);
    return;
  }

  destroy() {

  }
}
