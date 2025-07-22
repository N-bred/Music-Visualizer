import {
  stateChangedEvent,
  changedVolumeEvent,
  changedSongStateEvent,
  changedThemeIndexEvent,
  changedSceneIndexEvent,
  songUploadedEvent,
  changedRotationCheckboxEvent,
  changedPanCheckboxEvent,
  changedZoomCheckboxEvent,
  addedNewThemeEvent,
  progressBarClickedEvent,
  songEndedEvent,
  songChangedEvent,
  newSongSelectedEvent,
  removedThemeButtonEvent,
  updateThemeButtonEvent,
  addThemeButtonEvent,
  updatedThemeDataEvent,
} from "./Events";
import type { Theme, Song, StateManagerProps, State } from "./types";
import { threeThemeToObject, updateCSSVariables } from "./utils/utils";

const CSS_VARIABLE_NAMES = [
  {
    name: "--accent-color",
  },
  {
    name: "--song-selected-color",
  },
];

export default class StateManager {
  private props: StateManagerProps;
  private _state: State;

  constructor(props: StateManagerProps, mode: string) {
    this.props = props;
    this._state = props.state;

    // Children Event Listeners
    this.initializeEventHandlers();

    // Global CSS Variables Setup
    this.handleUpdateCSSVariables();

    // FPS Counter Setup
    this.handleFPSCounter();

    // Children UI Setups
    this.handlePlayerPanelSetup();

    if (mode === "development") {
      this.handleSongsPanelSetup();
    }

    this.handlePropertiesPanelSetup();

    // Initial State Synchronization
    this.updateState({});
  }

  get state() {
    return this._state;
  }

  get lastSongListIndex() {
    return this._state.songList.length - 1;
  }

  get lastThemeIndex() {
    return this._state.themes.length - 1;
  }

  updateState(newState: Partial<State>) {
    this._state = { ...this._state, ...newState };
    window.dispatchEvent(new CustomEvent(stateChangedEvent, { detail: { ...this._state } }));
  }

  initializeEventHandlers() {
    this.handlePlayerEvents();
    this.handleSongPanelEvents();
    this.handlePropertiesPanelEvents();
    this.handleWindowResize();
    this.handleKeyboardEvents();
  }

  handleUpdateCSSVariables() {
    updateCSSVariables(this._state.themes[this._state.themeIndex], CSS_VARIABLE_NAMES);
  }

  // FPS Counter

  handleFPSCounter() {
    this.props.fpsCounter.dom.classList.add("fpsCounter");
    this.props.fpsCounter.dom.removeAttribute("style");
  }

  handleShowFPSCounter() {
    if (this._state.isFPSCounterShowing) {
      document.body.removeChild(this.props.fpsCounter.dom);
    } else {
      document.body.appendChild(this.props.fpsCounter.dom);
    }
    this.updateState({ isFPSCounterShowing: !this._state.isFPSCounterShowing });
  }

  // Player Panel

  handlePlayerPanelSetup() {
    this.props.player.handleVolumeUI(this._state.volume);
  }

  handlePlayerEvents() {
    this.handlePlayerChangedSong();
    this.handlePlayerNewSongSelected();
    this.handlePlayerVolumeChanged();
    this.handlePlayerProgressBarClicked();
    this.handleSongEnded();
    this.handleSongChanged();
  }

  handlePlayerChangedSong() {
    window.addEventListener(changedSongStateEvent, (e: CustomEventInit) => {
      this.updateState({ isPlaying: e.detail.isPlaying });

      if (this._state.isPlaying) {
        this.props.audioManager.play();
        this.handlePlayerProgressBarInterval(false);
      } else {
        this.props.audioManager.pause();
        this.handlePlayerProgressBarInterval(true);
      }
    });
  }

  handlePlayerNewSongSelected() {
    window.addEventListener(newSongSelectedEvent, async (e: CustomEventInit) => {
      this.updateState({
        currentSong: e.detail.currentSong,
        isPlaying: e.detail.isPlaying,
      });

      this.handlePlayerProgressBarInterval(true);
      this.props.player.handleUpdateProgressBarUI(0, 0);
      this.props.songPanel.handleSongListStyles(this._state.currentSong);
      this.props.audioManager.setSong(this._state.currentSong);

      if (this._state.isPlaying) {
        this.props.audioManager.play();
        this.props.player.handlePlayPauseButtonUI(true);
        this.handlePlayerProgressBarInterval(false);
      }
    });
  }

  handlePlayerVolumeChanged() {
    window.addEventListener(changedVolumeEvent, (e: CustomEventInit) => {
      this.props.persistedValues.volume.set(e.detail.volume);
      this.updateState({ volume: e.detail.volume });
    });
  }

  handlePlayerProgressBarClicked() {
    window.addEventListener(progressBarClickedEvent, (e: CustomEventInit) => {
      const percentage = e.detail.progressBarClickPosition;
      const specificSecond = percentage * (this.props.audioManager.duration || 0);

      this.updateState({ isPlaying: e.detail.isPlaying });
      this.props.audioManager.playFromSecond(specificSecond);
      this.props.player.handlePlayPauseButtonUI(e.detail.isPlaying);
      this.props.player.handleUpdateProgressBarUI(specificSecond, percentage);
    });
  }

  handlePlayerProgressBarInterval(removeInterval: boolean) {
    if (removeInterval) {
      clearInterval(this._state.playerProgressBarInterval);
    } else {
      this._state.playerProgressBarInterval = setInterval(() => {
        const percentage = this.props.audioManager.currentTime / (this.props.audioManager.duration || 1);
        const specificSecond = percentage * (this.props.audioManager.duration || 0);
        this.props.player.handleUpdateProgressBarUI(specificSecond, percentage);
      }, 1000);
    }
  }

  handleSongEnded() {
    window.addEventListener(songEndedEvent, () => {
      this.handlePlayerProgressBarInterval(true);
      this.props.audioManager.stop();
      this.props.player.handlePlayPauseButtonUI(false);
      this.updateState({ isPlaying: false });
      this.props.player.handleUpdateProgressBarUI(0, 0);
    });
  }

  handleSongChanged() {
    window.addEventListener(songChangedEvent, () => {
      this.props.player.handleTotalDurationSpan(this.props.audioManager.duration || 0);
    });
  }

  // Songs Panel

  handleSongsPanelSetup() {
    this.props.songPanel.handleRefreshUIState(false);
  }

  handleSongPanelEvents() {
    this.handleAddNewSong();
  }

  handleAddNewSong() {
    window.addEventListener(songUploadedEvent, ({ detail }: CustomEventInit<Song>) => {
      const found = this._state.songList.findIndex((song) => song.id === detail!.id) !== -1;

      if (found) {
        this.props.songPanel.handlePostFormSubmission(false);
        return;
      }

      this.updateState({
        songList: [...this._state.songList, detail!],
        currentSong: this.lastSongListIndex + 1,
      });

      this.props.songPanel.handlePostFormSubmission(true);
    });
  }

  // Properties Panel

  handlePropertiesPanelSetup() {
    this.handlePopulateScenesDropdown();
    this.handlePopulateThemesDropdown();
    this.props.propertiesPanel.handleOrbitControlsProperties();
    this.props.propertiesPanel.handleSceneSchemeChanged(this.props.sceneManager.currentScene.scheme());
  }

  handlePopulateScenesDropdown() {
    this.props.propertiesPanel.populateScenesDropdown(this.props.sceneManager.scenes, this._state.sceneIndex);
  }

  handlePopulateThemesDropdown() {
    this.props.propertiesPanel.populateThemesDropdown(this._state.themes, this._state.themeIndex);
  }

  handlePropertiesPanelEvents() {
    this.handleSceneIndex();
    this.handleSceneChangeTheme();
    this.handleRotationCheckbox();
    this.handlePanCheckbox();
    this.handleZoomCheckbox();
    this.handleAddCustomTheme();
    this.handleUpdatedThemeData();
    this.handleAddCustomThemeButton();
    this.handleUpdateCustomThemeButton();
    this.handleDeleteCustomThemeButton();
  }

  handleSceneIndex() {
    window.addEventListener(changedSceneIndexEvent, (e: CustomEventInit) => {
      this.props.persistedValues.sceneIndex.set(e.detail.sceneIndex);
      this.updateState({ sceneIndex: e.detail.sceneIndex });
      this.props.sceneManager.setCurrentScene(this._state.sceneIndex);
      this.props.sceneManager.setCurrentThemeIndex(this._state.themeIndex);
      const schema = this.props.sceneManager.currentScene.scheme();
      this.props.propertiesPanel.handleSceneSchemeChanged(schema);
    });
  }

  handleSceneChangeTheme() {
    window.addEventListener(changedThemeIndexEvent, (e: CustomEventInit) => {
      if (e.detail.saveToLocalStorage) {
        this.props.persistedValues.themeIndex.set(e.detail.themeIndex);
      }
      this.updateState({ themeIndex: e.detail.themeIndex });
      this.props.sceneManager.currentScene.changeTheme(this._state.themeIndex);
      this.props.sceneManager.setCurrentThemeIndex(this._state.themeIndex);
      this.handleUpdateCSSVariables();
    });
  }

  handleRotationCheckbox() {
    window.addEventListener(changedRotationCheckboxEvent, (e: CustomEventInit) => {
      this.props.persistedValues.rotationEnabled.set(e.detail.rotationEnabled);
      this.updateState({ rotationEnabled: e.detail.rotationEnabled });
      this.props.orbitControls.enableRotate = this._state.rotationEnabled;
    });
  }

  handlePanCheckbox() {
    window.addEventListener(changedPanCheckboxEvent, (e: CustomEventInit) => {
      this.props.persistedValues.panEnabled.set(e.detail.panEnabled);
      this.updateState({ panEnabled: e.detail.panEnabled });
      this.props.orbitControls.enablePan = this._state.panEnabled;
    });
  }

  handleZoomCheckbox() {
    window.addEventListener(changedZoomCheckboxEvent, (e: CustomEventInit) => {
      this.props.persistedValues.zoomEnabled.set(e.detail.zoomEnabled);
      this.updateState({ zoomEnabled: e.detail.zoomEnabled });
      this.props.orbitControls.enableZoom = this._state.zoomEnabled;
    });
  }

  handleAddCustomTheme() {
    window.addEventListener(addedNewThemeEvent, ({ detail }: CustomEventInit<Theme>) => {
      const isFound =
        this._state.themes.findIndex((theme, index) => theme.name === detail!.name && index !== this._state.themeIndex) !== -1 &&
        !this._state.isUpdating;

      if (isFound) return;

      this.updateState({
        themes: this._state.themes.map((theme, i) => {
          if (i === this._state.themeIndex) return detail!;
          return theme;
        }),
      });

      this.props.persistedValues.themes.set(this._state.themes);
      this.props.persistedValues.themeIndex.set(this.lastThemeIndex);
      this.handlePopulateThemesDropdown();
      this.props.propertiesPanel.handleSelectThemeIndex(this._state.themeIndex, true);
    });
  }

  handleUpdatedThemeData() {
    window.addEventListener(updatedThemeDataEvent, (e: CustomEventInit) => {
      const key = e.detail.key as keyof Theme;
      this._state.themes[this._state.themeIndex][key] = e.detail.value;
    });
  }

  handleAddCustomThemeButton() {
    window.addEventListener(addThemeButtonEvent, (e: CustomEventInit) => {
      this.updateState({
        themes: [...this._state.themes, e.detail.theme],
        themeIndex: this.lastThemeIndex + 1,
        isUpdating: e.detail.isUpdating,
      });

      this.props.propertiesPanel.handleCustomThemesFormFillContent(threeThemeToObject(e.detail.theme));
      this.handlePopulateThemesDropdown();
      this.props.propertiesPanel.handleSelectThemeIndex(this._state.themeIndex, false);
    });
  }

  handleUpdateCustomThemeButton() {
    window.addEventListener(updateThemeButtonEvent, (e: CustomEventInit) => {
      this.updateState({
        isUpdating: e.detail.isUpdating,
      });

      const theme = this._state.themes.find((_, i) => i === e.detail.themeIndex);

      if (theme) {
        const formData = threeThemeToObject(theme);
        this.props.propertiesPanel.handleCustomThemesFormFillContent(formData);
      }
    });
  }

  handleDeleteCustomThemeButton() {
    window.addEventListener(removedThemeButtonEvent, (e: CustomEventInit) => {
      this.updateState({
        themes: this._state.themes.filter((_, i) => i !== e.detail.themeIndex),
        themeIndex: this.lastThemeIndex - 1,
      });

      this.props.persistedValues.themes.set(this._state.themes);
      this.props.persistedValues.themeIndex.set(this.lastThemeIndex);
      this.handlePopulateThemesDropdown();
      this.props.propertiesPanel.handleSelectThemeIndex(this._state.themeIndex, true);
    });
  }

  // Animation Loop Handling

  handlePlayPauseAnimation() {
    if (this.state.isAnimationRunning) {
      this.handlePauseAnimation();
    } else {
      this.handlePlayAnimation();
    }
  }

  handlePauseAnimation() {
    this.props.renderer.setAnimationLoop(null);
    this.updateState({ isAnimationRunning: false });
  }

  handlePlayAnimation() {
    this.props.renderer.setAnimationLoop(() => {
      if (this._state.isFPSCounterShowing) {
        this.props.fpsCounter.begin();
      }

      this.props.updateFn();

      if (this._state.isFPSCounterShowing) {
        this.props.fpsCounter.end();
      }
    });

    this.updateState({ isAnimationRunning: true });
  }

  // UI Events

  handleWindowResize() {
    window.addEventListener("resize", () => {
      this.updateState({
        width: this.props.canvasContainer.getBoundingClientRect().width || 0,
        height: this.props.canvasContainer.getBoundingClientRect().height || 0,
      });
      this.props.camera.aspect = this._state.width / this._state.height;
      this.props.camera.updateProjectionMatrix();
      this.props.renderer.setSize(this._state.width, this._state.height);
    });
  }

  handleKeyboardEvents() {
    window.addEventListener("keyup", (e) => {
      if (e.ctrlKey && e.altKey && e.metaKey) {
        switch (e.code) {
          case "KeyD":
            console.log(this._state);
            break;
          case "KeyS":
            this.handleShowFPSCounter();
            break;
          case "ArrowUp":
            this.props.player.handlePreviousButton();
            break;
          case "ArrowDown":
            this.props.player.handleNextButton();
            break;
          case "ArrowLeft":
            this.props.player.handlePreviousButton();
            break;
          case "ArrowRight":
            this.props.player.handleNextButton();
            break;
          case "KeyP":
            this.props.player.handlePlayPauseButton();
            break;
          case "Space":
            this.props.player.handlePlayPauseButton();
            break;
          case "BracketRight":
            this.handlePlayPauseAnimation();
            break;
          case "KeyO":
            this.handlePlayPauseAnimation();
            break;
          case "KeyL":
            this.handlePauseAnimation();
            this.props.player.handlePlayPauseButton(false);
            break;
          case "KeyK":
            this.handlePlayAnimation();
            this.props.player.handlePlayPauseButton(true);
            break;
          case "KeyF":
            this.props.canvasPanel.handleFullscreenButton();
            break;
          case "KeyT":
            this.props.canvasPanel.handleTheaterButton();
            break;
          default:
            break;
        }
      }
    });
  }
}
