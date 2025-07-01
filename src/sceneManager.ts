import type CustomScene from "./customScene";
import type { theme } from "./stateManager";

export type scene = {
  name: string;
  sceneClass: typeof CustomScene;
};

type sceneManagerProps = {
  scenes: scene[];
  index: number;
  numberOfFrequencies: number;
  themes: theme[];
  currentThemeIndex: number;
};

export default class SceneManager {
  private _scenes: scene[] = [];
  private themes: theme[] = [];
  private currentThemeIndex: number;
  public currentScene: CustomScene;
  public currentSceneIndex: number = 0;
  private numberOfFrequencies: number;

  constructor({
    scenes,
    index,
    numberOfFrequencies,
    themes,
    currentThemeIndex,
  }: sceneManagerProps) {
    this._scenes = scenes;
    this.currentSceneIndex = index;
    this.numberOfFrequencies = numberOfFrequencies;
    this.themes = themes;
    this.currentThemeIndex = currentThemeIndex;
    this.currentScene = new this._scenes[this.currentSceneIndex].sceneClass(
      this.numberOfFrequencies,
      this.themes,
      this.currentThemeIndex
    );
  }

  get scenes(): scene[] {
    return this._scenes;
  }

  setCurrentThemeIndex(index: number) {
    this.currentThemeIndex = index;
  }

  setCurrentScene(index: number) {
    this.currentScene.destroy();
    this.currentSceneIndex = index;
    this.currentScene = new this._scenes[index].sceneClass(
      this.numberOfFrequencies,
      this.themes,
      this.currentThemeIndex
    );
  }

  setNumberOfFrequencies(n: number) {
    this.numberOfFrequencies = n;
    this.setCurrentScene(this.currentSceneIndex);
  }
}
