import * as T from "three";
import type StateManager from "./stateManager";
import {
  changedThemeIndexEvent,
  changedRotationCheckboxEvent,
  changedPanCheckboxEvent,
  changedZoomCheckboxEvent,
  changedSceneIndexEvent,
  AddedNewThemeEvent,
} from "./Events";
import type { theme } from "./stateManager";
import type { scene } from "./sceneManager";

type PropertiesPanelState = {
  sceneIndex: number;
  themeIndex: number;
  rotationEnabled: boolean;
  panEnabled: boolean;
  zoomEnabled: boolean;
  showingColorForm: boolean;
};

export default class PropertiesPanel {
  private scenesDropdown: HTMLSelectElement;
  private themesDropdown: HTMLSelectElement;
  private rotationCheckbox: HTMLInputElement;
  private panCheckbox: HTMLInputElement;
  private zoomCheckbox: HTMLInputElement;
  private themesDropdownContainer: HTMLDivElement;
  private customThemesFormContainer: HTMLDivElement;
  private customThemesButton: HTMLButtonElement;
  private customColorName: HTMLInputElement;
  private initialColorInput: HTMLInputElement;
  private transitionColorInput: HTMLInputElement;
  private customThemesForm: HTMLFormElement;
  private _customTheme?: theme;
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
    this.themesDropdownContainer = document.querySelector(
      ".themes-dropdown-container"
    )!;
    this.customThemesFormContainer = document.querySelector(
      ".custom-theme-form-container"
    )!;

    this.customThemesForm = document.querySelector("#custom-theme-form")!;

    this.customThemesButton = document.querySelector("#custom-themes-button")!;

    this.initialColorInput = document.querySelector("#initial-color-input")!;
    this.transitionColorInput = document.querySelector(
      "#transition-color-input"
    )!;

    this.customColorName = document.querySelector("#custom-color-name")!;

    this._stateManager = stateManager;

    this._state = {
      sceneIndex: this._stateManager.state.sceneIndex,
      themeIndex: this._stateManager.state.themeIndex,
      rotationEnabled: this._stateManager.state.rotationEnabled,
      panEnabled: this._stateManager.state.panEnabled,
      zoomEnabled: this._stateManager.state.zoomEnabled,
      showingColorForm: this.customThemesButton.dataset.open === "true",
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

    this.customThemesButton.addEventListener("click", () => {
      this.handleCustomThemesButton();
    });

    this.customThemesForm.addEventListener("submit", (e) => {
      this.handleCustomThemesForm(e);
    });
  }

  get state(): PropertiesPanelState {
    return this._state;
  }

  get customTheme(): theme {
    return this._customTheme!;
  }

  populateThemesDropdown(themes: theme[]) {
    while (this.themesDropdown.firstChild) {
      this.themesDropdown.removeChild(this.themesDropdown.lastChild!);
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
    while (this.scenesDropdown.firstChild) {
      this.scenesDropdown.removeChild(this.scenesDropdown.lastChild!);
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

  handleCustomThemesForm(e: Event) {
    e.preventDefault();

    this._customTheme = {
      name: this.customColorName.value,
      color: new T.Color(this.initialColorInput.value),
      transitionColor: new T.Color(this.transitionColorInput.value),
    };

    this.customColorName.value = "";
    this.initialColorInput.value = "0x000000";
    this.transitionColorInput.value = "0x000000";

    this.customThemesButton.click();
    window.dispatchEvent(AddedNewThemeEvent);
  }

  handleCustomThemesButton() {
    this._state.showingColorForm =
      this.customThemesButton.dataset.open === "true";
    this.customThemesButton.dataset.open = `${!this._state.showingColorForm}`;

    if (!this._state.showingColorForm) {
      this.themesDropdownContainer.classList.add("hide");
      this.customThemesFormContainer.classList.remove("hide");
      this.customThemesButton.textContent =
        this.customThemesButton.dataset.showing!;
    } else {
      this.themesDropdownContainer.classList.remove("hide");
      this.customThemesFormContainer.classList.add("hide");
      this.customThemesButton.textContent =
        this.customThemesButton.dataset.form!;
    }
  }
}
