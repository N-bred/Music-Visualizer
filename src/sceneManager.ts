import type CustomScene from "./customScene";
import type { Theme, Scene, SceneManagerProps } from "./types";

export default class SceneManager {
  private _scenes: Scene[] = [];
  private themes: Theme[] = [];
  private currentThemeIndex: number;
  public currentScene: CustomScene;
  public currentSceneIndex: number = 0;
  private numberOfFrequencies: number;

  constructor({ scenes, index, numberOfFrequencies, themes, currentThemeIndex }: SceneManagerProps) {
    this._scenes = scenes;
    this.currentSceneIndex = index;
    this.numberOfFrequencies = numberOfFrequencies;
    this.themes = themes;
    this.currentThemeIndex = currentThemeIndex;
    this.currentScene = new this._scenes[this.currentSceneIndex].sceneClass(this.numberOfFrequencies, this.themes, this.currentThemeIndex);
  }

  get scenes(): Scene[] {
    return this._scenes;
  }

  setCurrentThemeIndex(index: number) {
    this.currentThemeIndex = index;
  }

  setCurrentScene(index: number) {
    this.currentScene.destroy();
    this.currentSceneIndex = index;
    this.currentScene = new this._scenes[index].sceneClass(this.numberOfFrequencies, this.themes, this.currentThemeIndex);
  }

  setNumberOfFrequencies(n: number) {
    this.numberOfFrequencies = n;
    this.setCurrentScene(this.currentSceneIndex);
  }
}
