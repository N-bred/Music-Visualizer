import type StateManager from "./stateManager";
import { changedThemeIndexEvent } from "./Events";
import type { theme } from "./customScene";

type PropertiesPanelState = {
  themeIndex: number;
};

export default class PropertiesPanel {
  private themesDropdown: HTMLSelectElement;
  private _stateManager: StateManager;
  private _state: PropertiesPanelState;

  constructor(stateManager: StateManager) {
    this.themesDropdown = document.querySelector("#themes-dropdown")!;
    this.themesDropdown.selectedIndex = 0;
    this._stateManager = stateManager;
    this._state = {
      themeIndex: this.themesDropdown.options.selectedIndex,
    };

    this.themesDropdown.addEventListener("change", () => {
      this.handleThemesDropdown();
    });
  }

  get state(): PropertiesPanelState {
    return this._state;
  }

  populateDropdown(themes: theme[]) {
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
}
