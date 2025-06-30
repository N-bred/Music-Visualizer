import type CustomScene from "./customScene";

export type scene = {
  name: string;
  sceneClass: typeof CustomScene;
};

type sceneManagerProps = {
  scenes: scene[];
  index: number;
  numberOfFrequencies: number;
};

export default class SceneManager {
  private _scenes: scene[] = [];
  public currentScene: CustomScene;
  public currentSceneIndex: number = 0;
  private numberOfFrequencies: number;

  constructor({ scenes, index, numberOfFrequencies }: sceneManagerProps) {
    this._scenes = scenes;
    this.currentSceneIndex = index;
    this.numberOfFrequencies = numberOfFrequencies;
    this.currentScene = new this._scenes[this.currentSceneIndex].sceneClass(
      this.numberOfFrequencies
    );
  }

  get scenes(): scene[] {
    return this._scenes;
  }

  setCurrentScene(index: number) {
    this.currentScene.destroy();
    this.currentSceneIndex = index;
    this.currentScene = new this._scenes[index].sceneClass(
      this.numberOfFrequencies
    );
  }

  setNumberOfFrequencies(n: number) {
    this.numberOfFrequencies = n;
    this.setCurrentScene(this.currentSceneIndex);
  }
}
