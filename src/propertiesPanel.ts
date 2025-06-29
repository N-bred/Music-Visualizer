import type StateManager from "./stateManager";
import {
  changedThemeIndexEvent,
  changedRotationCheckboxEvent,
  changedPanCheckboxEvent,
  changedZoomCheckboxEvent,
} from "./Events";
import type { theme } from "./customScene";

type PropertiesPanelState = {
  themeIndex: number;
  rotationEnabled: boolean;
  panEnabled: boolean;
  zoomEnabled: boolean;
};

export default class PropertiesPanel {
  private themesDropdown: HTMLSelectElement;
  private rotationCheckbox: HTMLInputElement;
  private panCheckbox: HTMLInputElement;
  private zoomCheckbox: HTMLInputElement;
  private _stateManager: StateManager;
  private _state: PropertiesPanelState;

  constructor(stateManager: StateManager) {
    this.themesDropdown = document.querySelector("#themes-dropdown")!;
    this.rotationCheckbox = document.querySelector(
      "#enable-rotation-checkbox"
    )!;
    this.panCheckbox = document.querySelector("#enable-pan-checkbox")!;
    this.zoomCheckbox = document.querySelector("#enable-zoom-checkbox")!;

    this.themesDropdown.selectedIndex = 0;
    this._stateManager = stateManager;
    this._state = {
      themeIndex: this.themesDropdown.options.selectedIndex,
      rotationEnabled: this._stateManager.state.rotationEnabled,
      panEnabled: this._stateManager.state.panEnabled,
      zoomEnabled: this._stateManager.state.zoomEnabled,
    };

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
    for (const theme of themes) {
      const option = document.createElement("option");
      option.value = theme.name;
      option.textContent = theme.name;
      this.themesDropdown.appendChild(option);
    }
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
