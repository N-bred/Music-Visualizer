import * as T from "three";

declare const window: Window &
  typeof globalThis & {
    theme: ThemeManager;
  };

export type Direction = "x" | "y" | "z";

export type BoxType = {
  transitionColor: T.Color;
  position: T.Vector3;
  color: T.Color;
  direction: Direction;
  rotation: number;
};

type ThemeType = {
  theme?: "default" | "chaotic";
} & BoxType;

export default class ThemeManager {
  private theme: ThemeType["theme"];
  private color: BoxType["color"];
  private transitionColor: BoxType["transitionColor"];
  private direction: BoxType["direction"];
  private rotation: BoxType["rotation"];
  private position: BoxType["position"];

  constructor(
    theme: ThemeType["theme"] = "chaotic",
    color: BoxType["color"] = new T.Color(0xffffff),
    transitionColor: BoxType["transitionColor"] = new T.Color(0xff0000),
    direction: BoxType["direction"] = "y",
    rotation: BoxType["rotation"] = 0,
    position: BoxType["position"] = new T.Vector3(0, 0, 0)
  ) {
    this.theme = theme;
    this.color = color;
    this.transitionColor = transitionColor;
    this.direction = direction;
    this.rotation = rotation;
    this.position = position;
    this.setup();
  }

  static getTheme() {
    if (window.theme) return window.theme;
  }

  setup() {
    window.theme = this;
  }

  get ThemeObject(): ThemeType {
    return {
      theme: this.theme,
      color: this.color,
      transitionColor: this.transitionColor,
      direction: this.direction,
      position: this.position,
      rotation: this.rotation,
    };
  }

  setDirection(direction: Direction) {
    this.direction = direction;
  }

  calculateAngle(i: number, quantity: number): number {
    switch (this.theme) {
      case "chaotic":
        return i * (quantity / (2 * 180));
      default:
        return i * ((2 * Math.PI) / quantity);
    }
  }

  calculatePosition(i: number, radius: number, angle: number): T.Vector3 {
    switch (this.theme) {
      case "chaotic":
        return new T.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          i
        );
      default:
        return this.createPositionVector(this.direction, i);
    }
  }

  createPositionVector(direction: Direction, i: number): T.Vector3 {
    if (direction === "x") {
      return new T.Vector3(0, -i, 0);
    }
    if (direction === "y") {
      return new T.Vector3(-i, 0, 0);
    }
    if (direction === "z") {
      return new T.Vector3(-i, -i, 0);
    }
    return new T.Vector3(0, 0, 0);
  }
}
