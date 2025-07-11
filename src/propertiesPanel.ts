import * as T from "three";
import {
  AddedNewThemeName,
  changedThemeIndexName,
  changedRotationCheckboxName,
  changedPanCheckboxName,
  changedZoomCheckboxName,
  changedSceneIndexName,
} from "./Events";
import type { theme } from "./stateManager";
import type { scene } from "./sceneManager";

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

  constructor() {
    this.scenesDropdown = document.querySelector("#scenes-dropdown")!;
    this.themesDropdown = document.querySelector("#themes-dropdown")!;
    this.rotationCheckbox = document.querySelector("#enable-rotation-checkbox")!;
    this.panCheckbox = document.querySelector("#enable-pan-checkbox")!;
    this.zoomCheckbox = document.querySelector("#enable-zoom-checkbox")!;
    this.themesDropdownContainer = document.querySelector(".themes-dropdown-container")!;
    this.customThemesFormContainer = document.querySelector(".custom-theme-form-container")!;
    this.customThemesForm = document.querySelector("#custom-theme-form")!;
    this.customThemesButton = document.querySelector("#custom-themes-button")!;
    this.initialColorInput = document.querySelector("#initial-color-input")!;
    this.transitionColorInput = document.querySelector("#transition-color-input")!;
    this.customColorName = document.querySelector("#custom-color-name")!;

    // EVENTS
    this.scenesDropdown.addEventListener("change", () => this.handleScenesDropdown());
    this.themesDropdown.addEventListener("change", () => this.handleThemesDropdown());
    this.rotationCheckbox.addEventListener("change", () => this.handleRotationCheckbox());
    this.panCheckbox.addEventListener("change", () => this.handlePanCheckbox());
    this.zoomCheckbox.addEventListener("change", () => this.handleZoomCheckbox());
    this.customThemesButton.addEventListener("click", () => this.handleCustomThemesButton());
    this.customThemesForm.addEventListener("submit", (e) => this.handleCustomThemesForm(e));
  }

  handleCustomThemesButton() {
    const showingColorForm = this.customThemesButton.dataset.open === "true";
    this.customThemesButton.dataset.open = `${!showingColorForm}`;

    if (!showingColorForm) {
      this.themesDropdownContainer.classList.add("hide");
      this.customThemesFormContainer.classList.remove("hide");
      this.customThemesButton.textContent = this.customThemesButton.dataset.showing!;
    } else {
      this.themesDropdownContainer.classList.remove("hide");
      this.customThemesFormContainer.classList.add("hide");
      this.customThemesButton.textContent = this.customThemesButton.dataset.form!;
    }
  }

  populateThemesDropdown(themes: theme[], selectedIndex: number) {
    this.populateDropdown(this.themesDropdown, themes, selectedIndex);
  }

  populateScenesDropdown(scenes: scene[], selectedIndex: number) {
    this.populateDropdown(this.scenesDropdown, scenes, selectedIndex);
  }

  populateDropdown<T extends scene | theme>(dropdown: HTMLSelectElement, selectables: T[], selectedIndex: number) {
    while (dropdown.firstChild) {
      dropdown.removeChild(dropdown.lastChild!);
    }

    for (const selectable of selectables) {
      const option = document.createElement("option");
      option.value = selectable.name;
      option.textContent = selectable.name;
      dropdown.appendChild(option);
    }

    dropdown.selectedIndex = selectedIndex;
  }

  handleScenesDropdown() {
    window.dispatchEvent(
      new CustomEvent(changedSceneIndexName, {
        detail: {
          sceneIndex: this.scenesDropdown.options.selectedIndex,
        },
      })
    );
  }

  handleThemesDropdown() {
    window.dispatchEvent(
      new CustomEvent(changedThemeIndexName, {
        detail: {
          themeIndex: this.themesDropdown.options.selectedIndex,
        },
      })
    );
  }

  handleSelectThemeIndex(index: number) {
    this.themesDropdown.selectedIndex = index;

    window.dispatchEvent(
      new CustomEvent(changedThemeIndexName, {
        detail: {
          themeIndex: index,
        },
      })
    );
  }

  handleRotationCheckbox() {
    window.dispatchEvent(new CustomEvent(changedRotationCheckboxName, { detail: { rotationEnabled: this.rotationCheckbox.checked } }));
  }

  handlePanCheckbox() {
    window.dispatchEvent(new CustomEvent(changedPanCheckboxName, { detail: { panEnabled: this.panCheckbox.checked } }));
  }

  handleZoomCheckbox() {
    window.dispatchEvent(new CustomEvent(changedZoomCheckboxName, { detail: { zoomEnabled: this.zoomCheckbox.checked } }));
  }

  handleCustomThemesForm(e: Event) {
    e.preventDefault();

    window.dispatchEvent(
      new CustomEvent<theme>(AddedNewThemeName, {
        detail: {
          name: this.customColorName.value,
          color: new T.Color(this.initialColorInput.value),
          transitionColor: new T.Color(this.transitionColorInput.value),
        },
      })
    );

    this.handleResetForm();
    this.customThemesButton.click();
  }

  handleResetForm() {
    this.customThemesForm.reset();
  }
}
