import type CustomScene from "./customScene";
import type { Scene, SceneManagerProps } from "./types";

export default class SceneManager {
  private _scenes: Scene[] = [];

  public currentScene: CustomScene;
  public currentSceneIndex: number = 0;

  constructor({ scenes, index }: SceneManagerProps) {
    this._scenes = scenes;
    this.currentSceneIndex = index;
    this.currentScene = scenes[this.currentSceneIndex].scene;
  }

  get scenes(): Scene[] {
    return this._scenes;
  }

  setCurrentThemeIndex(index: number) {
    this.currentScene.changeTheme(index);
  }

  setCurrentScene(index: number) {
    this.currentSceneIndex = index;
    this.currentScene = this._scenes[index].scene;
  }
}
