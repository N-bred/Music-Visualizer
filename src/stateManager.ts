import {
  stateChangedName,
  changedVolumeName,
  changedSongStateName,
  changedThemeIndexName,
  changedSceneIndexName,
  songUploadedName,
  changedRotationCheckboxName,
  changedPanCheckboxName,
  changedZoomCheckboxName,
  AddedNewThemeName,
  progressBarClickedName,
  songEndedName,
  songChangedName,
  newSongSelectedName,
  sceneSchemeInputChanged,
} from "./Events";
import type { StateManagerProps, StateManagerState, Theme, Song, Schema } from "./types";

export default class StateManager {
  private props: StateManagerProps;
  private _state: StateManagerState;

  constructor(props: StateManagerProps) {
    this.props = props;
    this._state = {
      WIDTH: this.props.canvasContainer?.getBoundingClientRect().width || 0,
      HEIGHT: this.props.canvasContainer?.getBoundingClientRect().height || 0,
      isPlaying: false,
      volume: 0.5,
      currentSong: 0,
      sceneIndex: this.props.sceneIndex,
      themeIndex: this.props.themeIndex,
      isAnimationRunning: this.props.isAnimationRunning,
      rotationEnabled: this.props.rotationEnabled,
      panEnabled: this.props.rotationEnabled,
      zoomEnabled: this.props.zoomEnabled,
      songList: this.props.songList,
      themes: this.props.themes,
      playerProgressBarInterval: 0,
      sceneInputProperties: [],
    };
  }

  get state() {
    return this._state;
  }

  set currentSong(song: number) {
    this._state.currentSong = song;
  }

  get lastSongListIndex() {
    return this._state.songList.length - 1;
  }

  initializeEventHandlers() {
    this.handleStateChanged();
    this.handlePlayerEvents();
    this.handleSongPanelEvents();
    this.handlePropertiesPanelEvents();
    this.handleKeyboardEvents();
    this.handleWindowResize();
  }

  addProperty<K extends keyof StateManagerProps>(key: K, property: StateManagerProps[K]) {
    this.props[key] = property;
  }

  handleWindowResize() {
    window.addEventListener("resize", () => {
      this._state.WIDTH = this.props.canvasContainer?.getBoundingClientRect().width || 0;
      this._state.HEIGHT = this.props.canvasContainer?.getBoundingClientRect().height || 0;
      this.props.camera!.aspect = this._state.WIDTH / this._state.HEIGHT;
      this.props.camera!.updateProjectionMatrix();
      this.props.renderer!.setSize(this._state.WIDTH, this._state.HEIGHT);
    });
  }

  handleStateChanged(fn?: (state: StateManagerState) => void) {
    window.addEventListener(stateChangedName, () => {
      if (fn) {
        fn(this._state);
      }
    });
  }

  handlePlayerChangedSong() {
    window.addEventListener(changedSongStateName, (e: CustomEventInit) => {
      this._state.isPlaying = e.detail.isPlaying;

      if (this._state.isPlaying) {
        this.props.audioManager!.play();
        this.handlePlayerProgressBarInterval(false);
      } else {
        this.props.audioManager!.pause();
        this.handlePlayerProgressBarInterval(true);
      }

      window.dispatchEvent(new CustomEvent(stateChangedName, { detail: { ...this._state } }));
    });
  }

  handlePlayerProgressBarInterval(removeInterval: boolean) {
    if (removeInterval) {
      clearInterval(this._state.playerProgressBarInterval);
    } else {
      this._state.playerProgressBarInterval = setInterval(() => {
        const percentage = this.props.audioManager?.currentTime! / this.props.audioManager?.duration!;
        const specificSecond = percentage * this.props.audioManager!.duration!;
        this.props.player?.handleUpdateProgressBarUI(specificSecond, percentage);
      }, 1000);
    }
  }

  handleSongEnded() {
    window.addEventListener(songEndedName, () => {
      this.handlePlayerProgressBarInterval(true);
      this.props.audioManager?.stop();
      this.props.player?.handlePlayPauseButtonUI(false);
      this._state.isPlaying = false;
      this.props.player?.handleUpdateProgressBarUI(0, 0);
    });
  }

  handlePlayerNewSongSelected() {
    window.addEventListener(newSongSelectedName, async (e: CustomEventInit) => {
      this._state.currentSong = e.detail.currentSong;
      this._state.isPlaying = e.detail.isPlaying;

      this.handlePlayerProgressBarInterval(true);
      this.props.player!.handleUpdateProgressBarUI(0, 0);
      this.props.songPanel?.handleSongListStyles(this._state.currentSong);
      await this.props.audioManager!.setSong(this._state.currentSong);

      if (this._state.isPlaying) {
        this.props.audioManager!.play();
        this.props.player!.handlePlayPauseButtonUI(true);
        this.handlePlayerProgressBarInterval(false);
      }

      window.dispatchEvent(new CustomEvent(stateChangedName, { detail: { ...this._state } }));
    });
  }

  handlePlayerVolumeChanged() {
    window.addEventListener(changedVolumeName, (e: CustomEventInit) => {
      this._state.volume = e.detail.volume;

      window.dispatchEvent(new CustomEvent(stateChangedName, { detail: { ...this._state } }));
    });
  }

  handlePlayerProgressBarClicked() {
    window.addEventListener(progressBarClickedName, (e: CustomEventInit) => {
      const percentage = e.detail.progressBarClickPosition;
      const specificSecond = percentage * this.props.audioManager!.duration!;

      this._state.isPlaying = e.detail.isPlaying;
      this.props.audioManager?.playFromSecond(specificSecond);
      this.props.player?.handlePlayPauseButtonUI(e.detail.isPlaying);
      this.props.player?.handleUpdateProgressBarUI(specificSecond, percentage);

      window.dispatchEvent(new CustomEvent(stateChangedName, { detail: { ...this._state } }));
    });
  }

  handleSongChanged() {
    window.addEventListener(songChangedName, () => {
      this.props.player!.handleTotalDurationSpan(this.props.audioManager!.duration!);
    });
  }

  handlePlayerEvents() {
    this.handlePlayerChangedSong();
    this.handlePlayerNewSongSelected();
    this.handlePlayerVolumeChanged();
    this.handlePlayerProgressBarClicked();
    this.handleSongEnded();
    this.handleSongChanged();
  }

  handleAddNewSong() {
    window.addEventListener(songUploadedName, ({ detail }: CustomEventInit<Song>) => {
      const found = this.state.songList.findIndex((song) => song.id === detail!.id) !== -1;

      if (found) {
        this.props.songPanel?.handlePostFormSubmission(false);
        return;
      }

      this.state.songList.push(detail!);
      this._state.currentSong = this.lastSongListIndex;
      this.props.songPanel?.handlePostFormSubmission(true);
    });
  }

  handleSongPanelEvents() {
    this.handleAddNewSong();
  }

  handleSceneIndex() {
    window.addEventListener(changedSceneIndexName, (e: CustomEventInit) => {
      this._state.sceneIndex = e.detail.sceneIndex;
      this.props.sceneManager!.setCurrentScene(this._state.sceneIndex);
      this.props.sceneManager!.setCurrentThemeIndex(this._state.themeIndex);
    });
  }

  handleSceneSchemeChanged() {
    window.addEventListener(sceneSchemeInputChanged, (e: CustomEventInit<Schema[]>) => {
      const scheme = e.detail!;
      if (scheme.length < 1) return;
      this.props.propertiesPanel!.handleSceneSchemeChanged(scheme);
    });
  }

  handleSceneChangeTheme() {
    window.addEventListener(changedThemeIndexName, (e: CustomEventInit) => {
      this._state.themeIndex = e.detail.themeIndex;
      this.props.sceneManager!.currentScene?.changeTheme(this._state.themeIndex);
      this.props.sceneManager!.setCurrentThemeIndex(this._state.themeIndex);
    });
  }

  handlePropertiesPanelEvents() {
    this.handleSceneIndex();
    this.handleSceneChangeTheme();
    this.handleSceneSchemeChanged();
    this.handleRotationCheckbox();
    this.handlePanCheckbox();
    this.handleZoomCheckbox();
    this.handleAddCustomTheme();
  }

  handlePopulateThemesDropdown() {
    this.props.propertiesPanel?.populateThemesDropdown(this._state.themes, this._state.themeIndex);
  }

  handlePopulateScenesDropdown() {
    this.props.propertiesPanel?.populateScenesDropdown(this.props.sceneManager!.scenes, this._state.sceneIndex);
  }

  handleAddCustomTheme() {
    window.addEventListener(AddedNewThemeName, ({ detail }: CustomEventInit<Theme>) => {
      const isFound = this._state.themes.findIndex((theme) => theme.name === detail!.name);
      if (isFound !== -1) return;

      this._state.themes.push(detail!);
      this.handlePopulateThemesDropdown();
      this._state.themeIndex = this._state.themes.length - 1;
      this.props.propertiesPanel?.handleSelectThemeIndex(this._state.themeIndex);
    });
  }

  handleRotationCheckbox() {
    window.addEventListener(changedRotationCheckboxName, (e: CustomEventInit) => {
      this._state.rotationEnabled = e.detail.rotationEnabled;
      this.props.orbitControls!.enableRotate = this._state.rotationEnabled;
    });
  }

  handlePanCheckbox() {
    window.addEventListener(changedPanCheckboxName, (e: CustomEventInit) => {
      this._state.panEnabled = e.detail.panEnabled;
      this.props.orbitControls!.enablePan = this._state.panEnabled;
    });
  }

  handleZoomCheckbox() {
    window.addEventListener(changedZoomCheckboxName, (e: CustomEventInit) => {
      this._state.zoomEnabled = e.detail.zoomEnabled;
      this.props.orbitControls!.enableZoom = this._state.zoomEnabled;
    });
  }

  handlePropertiesPanelSetup() {
    this.handlePopulateThemesDropdown();
    this.handlePopulateScenesDropdown();
    this.props.propertiesPanel!.handleSceneSchemeChanged(this.props.sceneManager!.currentScene.scheme());
  }

  handlePopulateSongs() {
    this.props.songPanel!.handleRefreshUIState(false);
  }

  handleSongsPanelSetup() {
    this.handlePopulateSongs();
  }

  handleKeyboardEvents() {
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "d":
          console.log(this.props.audioManager?.currentTime);
          console.log(this._state);
          break;
        case "p":
          this.props.player?.handlePlayPauseButton();
          break;
        case "]":
          if (this.props.isAnimationRunning) {
            this.props.renderer!.setAnimationLoop(null);
            this.props.isAnimationRunning = false;
          } else {
            this.props.renderer!.setAnimationLoop(this.props.updateFn!);
            this.props.isAnimationRunning = true;
          }
          break;
        default:
          break;
      }
    });
  }
}
