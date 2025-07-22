import * as T from "three";
import {
  removedThemeButtonEvent,
  addedNewThemeEvent,
  changedThemeIndexEvent,
  changedRotationCheckboxEvent,
  changedPanCheckboxEvent,
  changedZoomCheckboxEvent,
  changedSceneIndexEvent,
  stateChangedEvent,
  updateThemeButtonEvent,
  addThemeButtonEvent,
  updatedThemeDataEvent,
  changedAnimationCheckboxEvent,
} from "./Events";
import type { Theme, Scene, Schema } from "./types";
import { alternateCheckedPropertie, populateDropdown, switchPanels } from "./utils/commonUIBehaviors";
import { createInputElementsFromSchema } from "./utils/utils";

const DEFAULT_THEME = {
  name: "",
  color: new T.Color("#000000"),
  transitionColor: new T.Color("#ffffff"),
  backgroundColor: new T.Color("#000000"),
};

export default class PropertiesPanel {
  private scenesDropdown: HTMLSelectElement;
  private themesDropdown: HTMLSelectElement;
  private rotationCheckbox: HTMLInputElement;
  private panCheckbox: HTMLInputElement;
  private zoomCheckbox: HTMLInputElement;
  private animationCheckbox: HTMLInputElement;
  private scenesDropdownContainer: HTMLDivElement;
  private scenesPropertiesContainer: HTMLDivElement;
  private themesDropdownContainer: HTMLDivElement;
  private customThemesFormContainer: HTMLDivElement;
  private scenesPropertiesForm: HTMLFormElement;
  private scenesPropertiesButton: HTMLButtonElement;
  private customThemesAddButton: HTMLButtonElement;
  private customThemesUpdateButton: HTMLButtonElement;
  private customThemesDeleteButton: HTMLButtonElement;
  private customThemesForm: HTMLFormElement;
  private customThemesFormButton: HTMLButtonElement;
  private customColorName: HTMLInputElement;
  private initialColorInput: HTMLInputElement;
  private transitionColorInput: HTMLInputElement;
  private backgroundColorInput: HTMLInputElement;

  constructor() {
    this.scenesDropdown = document.querySelector("#scenes-dropdown")!;
    this.themesDropdown = document.querySelector("#themes-dropdown")!;
    this.rotationCheckbox = document.querySelector("#enable-rotation-checkbox")!;
    this.panCheckbox = document.querySelector("#enable-pan-checkbox")!;
    this.zoomCheckbox = document.querySelector("#enable-zoom-checkbox")!;
    this.animationCheckbox = document.querySelector("#enable-animation-checkbox")!;
    this.scenesDropdownContainer = document.querySelector(".scenes-dropdown-container")!;
    this.scenesPropertiesContainer = document.querySelector(".scenes-properties-container")!;
    this.themesDropdownContainer = document.querySelector(".themes-dropdown-container")!;
    this.customThemesFormContainer = document.querySelector(".custom-theme-form-container")!;
    this.scenesPropertiesForm = document.querySelector("#scene-properties-form")!;
    this.scenesPropertiesButton = document.querySelector("#scenes-properties-button")!;
    this.customThemesForm = document.querySelector("#custom-theme-form")!;
    this.customThemesFormButton = document.querySelector("#custom-theme-form-button")!;
    this.customThemesAddButton = document.querySelector("#custom-themes-add-button")!;
    this.customThemesUpdateButton = document.querySelector("#custom-themes-update-button")!;
    this.customThemesDeleteButton = document.querySelector("#custom-themes-delete-button")!;
    this.customColorName = document.querySelector("#custom-color-name")!;
    this.initialColorInput = document.querySelector("#initial-color-input")!;
    this.transitionColorInput = document.querySelector("#transition-color-input")!;
    this.backgroundColorInput = document.querySelector("#background-color-input")!;

    // EVENTS
    this.scenesDropdown.addEventListener("change", () => this.handleScenesDropdown());
    this.themesDropdown.addEventListener("change", () => this.handleThemesDropdown());
    this.rotationCheckbox.addEventListener("change", () => this.handleRotationCheckbox());
    this.panCheckbox.addEventListener("change", () => this.handlePanCheckbox());
    this.zoomCheckbox.addEventListener("change", () => this.handleZoomCheckbox());
    this.animationCheckbox.addEventListener("change", () => this.handleAnimationCheckbox());
    this.customThemesAddButton.addEventListener("click", () => this.handleCustomThemesAddButton());
    this.customThemesUpdateButton.addEventListener("click", () => this.handleCustomThemesUpdateButton());
    this.customThemesDeleteButton.addEventListener("click", () => this.handleCustomThemesDeleteButton());
    this.customThemesForm.addEventListener("submit", (e) => this.handleCustomThemesForm(e));
    this.scenesPropertiesButton.addEventListener("click", () => this.handleScenePropertiesButton());
    this.scenesPropertiesForm.addEventListener("submit", (e) => this.handleScenesPropertiesForm(e));
    this.customColorName.addEventListener("change", (e) => this.handleThemeInputOnChange(e, "name"));
    this.initialColorInput.addEventListener("change", (e) => this.handleThemeInputOnChange(e, "color"));
    this.transitionColorInput.addEventListener("change", (e) => this.handleThemeInputOnChange(e, "transitionColor"));
    this.backgroundColorInput.addEventListener("change", (e) => this.handleThemeInputOnChange(e, "backgroundColor"));

    window.addEventListener(stateChangedEvent, (e: CustomEventInit) => {
      this.rotationCheckbox.dataset.enabled = e.detail.rotationEnabled;
      this.panCheckbox.dataset.enabled = e.detail.panEnabled;
      this.zoomCheckbox.dataset.enabled = e.detail.zoomEnabled;
    });
  }

  handleThemeInputOnChange(e: Event, key: keyof Theme) {
    let value: string | T.Color = (e.target! as HTMLInputElement).value;

    if (key !== "name") {
      value = new T.Color((e.target! as HTMLInputElement).value);
    }

    window.dispatchEvent(
      new CustomEvent(updatedThemeDataEvent, {
        detail: {
          key,
          value,
        },
      })
    );
  }

  handleScenePropertiesButton() {
    switchPanels(this.scenesPropertiesButton, this.scenesDropdownContainer, this.scenesPropertiesContainer);
  }

  handleButtonsUI(isUpdating: boolean) {
    this.handleResetForm();

    const showingFirstPanel = switchPanels(this.customThemesAddButton, this.themesDropdownContainer, this.customThemesFormContainer);

    if (showingFirstPanel) {
      this.customThemesDeleteButton.classList.remove("hidden");
      this.customThemesUpdateButton.classList.remove("hidden");
    } else {
      this.customThemesDeleteButton.classList.add("hidden");
      this.customThemesUpdateButton.classList.add("hidden");
    }

    if (isUpdating) {
      this.customThemesFormButton.textContent = this.customThemesFormButton.dataset.updateText!;
    } else {
      this.customThemesFormButton.textContent = this.customThemesFormButton.dataset.addText!;
    }
  }

  handleCustomThemesAddButton() {
    if (this.customThemesAddButton.dataset.open === "true") {
      this.handleButtonsUI(false);
      this.customThemesDeleteButton.click();
      return;
    }

    this.handleButtonsUI(false);
    window.dispatchEvent(
      new CustomEvent(addThemeButtonEvent, {
        detail: {
          isUpdating: false,
          theme: { ...DEFAULT_THEME },
        },
      })
    );
  }

  handleCustomThemesUpdateButton() {
    this.handleButtonsUI(true);
    window.dispatchEvent(
      new CustomEvent(updateThemeButtonEvent, {
        detail: {
          themeIndex: this.themesDropdown.options.selectedIndex,
          isUpdating: true,
        },
      })
    );
  }

  handleCustomThemesDeleteButton() {
    window.dispatchEvent(
      new CustomEvent(removedThemeButtonEvent, {
        detail: {
          themeIndex: this.themesDropdown.options.selectedIndex,
        },
      })
    );
  }

  populateScenesDropdown(scenes: Scene[], selectedIndex: number) {
    populateDropdown(this.scenesDropdown, scenes, selectedIndex);
  }

  handleScenesDropdown() {
    window.dispatchEvent(
      new CustomEvent(changedSceneIndexEvent, {
        detail: {
          sceneIndex: this.scenesDropdown.options.selectedIndex,
        },
      })
    );
  }

  populateThemesDropdown(themes: Theme[], selectedIndex: number) {
    populateDropdown(this.themesDropdown, themes, selectedIndex);
  }

  handleThemesDropdown() {
    window.dispatchEvent(
      new CustomEvent(changedThemeIndexEvent, {
        detail: {
          themeIndex: this.themesDropdown.options.selectedIndex,
          saveToLocalStorage: true,
        },
      })
    );
  }

  handleSelectThemeIndex(index: number, saveToLocalStorage: boolean) {
    this.themesDropdown.selectedIndex = index;

    window.dispatchEvent(
      new CustomEvent(changedThemeIndexEvent, {
        detail: {
          themeIndex: index,
          saveToLocalStorage,
        },
      })
    );
  }

  handleAnimationCheckbox() {
    window.dispatchEvent(new CustomEvent(changedAnimationCheckboxEvent, { detail: { animationEnabled: this.animationCheckbox.checked } }));
  }

  handleRotationCheckbox() {
    window.dispatchEvent(new CustomEvent(changedRotationCheckboxEvent, { detail: { rotationEnabled: this.rotationCheckbox.checked } }));
  }

  handlePanCheckbox() {
    window.dispatchEvent(new CustomEvent(changedPanCheckboxEvent, { detail: { panEnabled: this.panCheckbox.checked } }));
  }

  handleZoomCheckbox() {
    window.dispatchEvent(new CustomEvent(changedZoomCheckboxEvent, { detail: { zoomEnabled: this.zoomCheckbox.checked } }));
  }

  handleScenesPropertiesForm(e: Event) {
    e.preventDefault();
  }

  handleOrbitControlsProperties() {
    alternateCheckedPropertie(this.rotationCheckbox.dataset.enabled!, this.rotationCheckbox);
    alternateCheckedPropertie(this.panCheckbox.dataset.enabled!, this.panCheckbox);
    alternateCheckedPropertie(this.zoomCheckbox.dataset.enabled!, this.zoomCheckbox);
  }

  handleSceneSchemeChanged(scheme: Schema[]) {
    while (this.scenesPropertiesForm.firstChild) {
      this.scenesPropertiesForm.firstChild.remove();
    }

    if (scheme.length < 1) return;

    const results = createInputElementsFromSchema(scheme);

    results.forEach((result) => {
      result.input.addEventListener("change", result.eventHandler);
      this.scenesPropertiesForm.appendChild(result.label);
      this.scenesPropertiesForm.appendChild(result.input);
    });
  }

  handleCustomThemesForm(e: Event) {
    e.preventDefault();

    window.dispatchEvent(
      new CustomEvent<Theme>(addedNewThemeEvent, {
        detail: {
          name: this.customColorName.value,
          color: new T.Color(this.initialColorInput.value),
          transitionColor: new T.Color(this.transitionColorInput.value),
          backgroundColor: new T.Color(this.backgroundColorInput.value),
        },
      })
    );

    this.handleResetForm();
    this.handleButtonsUI(true);
  }

  handleResetForm() {
    this.customThemesForm.reset();
  }

  handleCustomThemesFormFillContent(formData: { name: string; color: string; transitionColor: string; backgroundColor: string }) {
    this.customColorName.value = formData.name;
    this.initialColorInput.value = formData.color;
    this.transitionColorInput.value = formData.transitionColor;
    this.backgroundColorInput.value = formData.backgroundColor;
  }
}
