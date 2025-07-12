import * as T from "three";
import {
  AddedNewThemeName,
  changedThemeIndexName,
  changedRotationCheckboxName,
  changedPanCheckboxName,
  changedZoomCheckboxName,
  changedSceneIndexName,
} from "./Events";
import type { Theme, Scene, Schema } from "./types";
import { populateDropdown, switchPanels } from "./utils/commonUIBehaviors";
import { createInputElementsFromSchema } from "./utils/utils";

export default class PropertiesPanel {
  private scenesDropdown: HTMLSelectElement;
  private themesDropdown: HTMLSelectElement;
  private rotationCheckbox: HTMLInputElement;
  private panCheckbox: HTMLInputElement;
  private zoomCheckbox: HTMLInputElement;
  private scenesDropdownContainer: HTMLDivElement;
  private scenesPropertiesContainer: HTMLDivElement;
  private themesDropdownContainer: HTMLDivElement;
  private customThemesFormContainer: HTMLDivElement;
  private scenesPropertiesForm: HTMLFormElement;
  private scenesPropertiesButton: HTMLButtonElement;
  private customThemesButton: HTMLButtonElement;
  private customColorName: HTMLInputElement;
  private initialColorInput: HTMLInputElement;
  private transitionColorInput: HTMLInputElement;
  private backgroundColorInput: HTMLInputElement;
  private customThemesForm: HTMLFormElement;

  constructor() {
    this.scenesDropdown = document.querySelector("#scenes-dropdown")!;
    this.themesDropdown = document.querySelector("#themes-dropdown")!;
    this.rotationCheckbox = document.querySelector("#enable-rotation-checkbox")!;
    this.panCheckbox = document.querySelector("#enable-pan-checkbox")!;
    this.zoomCheckbox = document.querySelector("#enable-zoom-checkbox")!;
    this.scenesDropdownContainer = document.querySelector(".scenes-dropdown-container")!;
    this.scenesPropertiesContainer = document.querySelector(".scenes-properties-container")!;
    this.themesDropdownContainer = document.querySelector(".themes-dropdown-container")!;
    this.customThemesFormContainer = document.querySelector(".custom-theme-form-container")!;
    this.scenesPropertiesForm = document.querySelector("#scene-properties-form")!;
    this.scenesPropertiesButton = document.querySelector("#scenes-properties-button")!;
    this.customThemesForm = document.querySelector("#custom-theme-form")!;
    this.customThemesButton = document.querySelector("#custom-themes-button")!;
    this.initialColorInput = document.querySelector("#initial-color-input")!;
    this.transitionColorInput = document.querySelector("#transition-color-input")!;
    this.backgroundColorInput = document.querySelector("#background-color-input")!;
    this.customColorName = document.querySelector("#custom-color-name")!;

    // EVENTS
    this.scenesDropdown.addEventListener("change", () => this.handleScenesDropdown());
    this.themesDropdown.addEventListener("change", () => this.handleThemesDropdown());
    this.rotationCheckbox.addEventListener("change", () => this.handleRotationCheckbox());
    this.panCheckbox.addEventListener("change", () => this.handlePanCheckbox());
    this.zoomCheckbox.addEventListener("change", () => this.handleZoomCheckbox());
    this.customThemesButton.addEventListener("click", () => this.handleCustomThemesButton());
    this.customThemesForm.addEventListener("submit", (e) => this.handleCustomThemesForm(e));
    this.scenesPropertiesButton.addEventListener("click", () => this.handleScenePropertiesButton());
    this.scenesPropertiesForm.addEventListener("submit", (e) => this.handleScenesPropertiesForm(e));
  }

  handleScenePropertiesButton() {
    switchPanels(this.scenesPropertiesButton, this.scenesDropdownContainer, this.scenesPropertiesContainer);
  }

  handleCustomThemesButton() {
    switchPanels(this.customThemesButton, this.themesDropdownContainer, this.customThemesFormContainer);
  }

  populateScenesDropdown(scenes: Scene[], selectedIndex: number) {
    populateDropdown(this.scenesDropdown, scenes, selectedIndex);
  }

  populateThemesDropdown(themes: Theme[], selectedIndex: number) {
    populateDropdown(this.themesDropdown, themes, selectedIndex);
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

  handleScenesPropertiesForm(e: Event) {
    e.preventDefault();

    window.dispatchEvent(
      new CustomEvent<Theme>(AddedNewThemeName, {
        detail: {
          name: this.customColorName.value,
          color: new T.Color(this.initialColorInput.value),
          transitionColor: new T.Color(this.transitionColorInput.value),
          backgroundColor: new T.Color(this.backgroundColorInput.value),
        },
      })
    );

    this.scenesPropertiesButton.click();
  }

  handleSceneSchemeChanged(scheme: Schema[]) {
    while (this.scenesPropertiesForm.firstChild) {
      this.scenesPropertiesForm.firstChild.remove();
    }

    const inputs = createInputElementsFromSchema(scheme);

    inputs.forEach(({ eventHandler, label, input }) => {
      input.addEventListener("change", eventHandler);
      this.scenesPropertiesForm.appendChild(label);
      this.scenesPropertiesForm.appendChild(input);
    });
  }

  handleCustomThemesForm(e: Event) {
    e.preventDefault();

    window.dispatchEvent(
      new CustomEvent<Theme>(AddedNewThemeName, {
        detail: {
          name: this.customColorName.value,
          color: new T.Color(this.initialColorInput.value),
          transitionColor: new T.Color(this.transitionColorInput.value),
          backgroundColor: new T.Color(this.backgroundColorInput.value),
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
