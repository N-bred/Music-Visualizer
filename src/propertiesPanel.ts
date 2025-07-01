import type StateManager from "./stateManager";
import {
  changedThemeIndexEvent,
  changedRotationCheckboxEvent,
  changedPanCheckboxEvent,
  changedZoomCheckboxEvent,
  changedSceneIndexEvent,
} from "./Events";
import type { theme } from "./stateManager";
import type { scene } from "./sceneManager";

type PropertiesPanelState = {
  sceneIndex: number;
  themeIndex: number;
  rotationEnabled: boolean;
  panEnabled: boolean;
  zoomEnabled: boolean;
};

export default class PropertiesPanel {
  private scenesDropdown: HTMLSelectElement;
  private themesDropdown: HTMLSelectElement;
  private rotationCheckbox: HTMLInputElement;
  private panCheckbox: HTMLInputElement;
  private zoomCheckbox: HTMLInputElement;
  private _stateManager: StateManager;
  private _state: PropertiesPanelState;

  constructor(stateManager: StateManager) {
    this.scenesDropdown = document.querySelector("#scenes-dropdown")!;
    this.themesDropdown = document.querySelector("#themes-dropdown")!;
    this.rotationCheckbox = document.querySelector(
      "#enable-rotation-checkbox"
    )!;
    this.panCheckbox = document.querySelector("#enable-pan-checkbox")!;
    this.zoomCheckbox = document.querySelector("#enable-zoom-checkbox")!;

    this._stateManager = stateManager;

    this._state = {
      sceneIndex: this._stateManager.state.sceneIndex,
      themeIndex: this._stateManager.state.themeIndex,
      rotationEnabled: this._stateManager.state.rotationEnabled,
      panEnabled: this._stateManager.state.panEnabled,
      zoomEnabled: this._stateManager.state.zoomEnabled,
    };

    this.scenesDropdown.addEventListener("change", () => {
      this.handleScenesDropdown();
    });

    this.themesDropdown.addEventListener("change", () => {
      this.handleThemesDropdown();
    });

    this.rotationCheckbox.addEventListener("change", () => {
      this.handleRotationCheckbox();
    });

    this.panCheckbox.addEventListener("change", () => {
      this.handlePanCheckbox();
    });

    this.zoomCheckbox.addEventListener("change", () => {
      this.handleZoomCheckbox();
    });
  }

  get state(): PropertiesPanelState {
    return this._state;
  }

  populateThemesDropdown(themes: theme[]) {
    for (const child of this.themesDropdown.children) {
      child.remove();
    }

    for (const theme of themes) {
      const option = document.createElement("option");
      option.value = theme.name;
      option.textContent = theme.name;
      this.themesDropdown.appendChild(option);
    }

    this.themesDropdown.selectedIndex = this._stateManager.state.themeIndex;
  }

  populateScenesDropdown(scenes: scene[]) {
    for (const child of this.scenesDropdown.children) {
      child.remove();
    }

    for (const scene of scenes) {
      const option = document.createElement("option");
      option.value = scene.name;
      option.textContent = scene.name;
      this.scenesDropdown.appendChild(option);
    }

    this.scenesDropdown.selectedIndex = this._stateManager.state.sceneIndex;
  }

  handleScenesDropdown() {
    this._state.sceneIndex = this.scenesDropdown.options.selectedIndex;
    window.dispatchEvent(changedSceneIndexEvent);
  }

  handleThemesDropdown() {
    this._state.themeIndex = this.themesDropdown.options.selectedIndex;
    window.dispatchEvent(changedThemeIndexEvent);
  }

  handleRotationCheckbox() {
    this._state.rotationEnabled = this.rotationCheckbox.checked;
    window.dispatchEvent(changedRotationCheckboxEvent);
  }

  handlePanCheckbox() {
    this._state.panEnabled = this.panCheckbox.checked;
    window.dispatchEvent(changedPanCheckboxEvent);
  }

  handleZoomCheckbox() {
    this._state.zoomEnabled = this.zoomCheckbox.checked;
    window.dispatchEvent(changedZoomCheckboxEvent);
  }
}
