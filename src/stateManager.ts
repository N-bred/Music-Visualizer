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
  AddedNewThemeEvent,
  progressBarClickedEvent,
  songEndedEvent,
  songChangedEvent,
  newSongSelectedEvent,
} from "./Events";
import type { Theme, Song, StateManagerProps, State } from "./types";

export default class StateManager {
  private props: StateManagerProps;
  private _state: State;

  constructor(props: StateManagerProps) {
    this.props = props;
    this._state = props.state;

    this.initializeEventHandlers();
    this.handleSongsPanelSetup();
    this.handlePropertiesPanelSetup();
    this.updateState({});
  }

  get state() {
    return this._state;
  }

  set currentSong(song: number) {
    this.updateState({ currentSong: song });
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
  
  handleSongsPanelSetup() {
    this.handlePopulateSongs();
  }

  handlePopulateSongs() {
    this.props.songPanel!.handleRefreshUIState(false);
  }

  handlePropertiesPanelSetup() {
    this.handlePopulateScenesDropdown();
    this.handlePopulateThemesDropdown();
    this.props.propertiesPanel!.handleSceneSchemeChanged(this.props.sceneManager!.currentScene.scheme());
  }
  
  handlePopulateScenesDropdown() {
    this.props.propertiesPanel?.populateScenesDropdown(this.props.sceneManager!.scenes, this._state.sceneIndex);
  }

  handlePopulateThemesDropdown() {
    this.props.propertiesPanel?.populateThemesDropdown(this._state.themes, this._state.themeIndex);
  }


  // Player Panel

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
      this.updateState({ isPlaying: e.detail!.isPlaying });

      if (this._state.isPlaying) {
        this.props.audioManager!.play();
        this.handlePlayerProgressBarInterval(false);
      } else {
        this.props.audioManager!.pause();
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
      this.props.player!.handleUpdateProgressBarUI(0, 0);
      this.props.songPanel?.handleSongListStyles(this._state.currentSong);
      await this.props.audioManager!.setSong(this._state.currentSong);

      if (this._state.isPlaying) {
        this.props.audioManager!.play();
        this.props.player!.handlePlayPauseButtonUI(true);
        this.handlePlayerProgressBarInterval(false);
      }
    });
  }

  handlePlayerVolumeChanged() {
    window.addEventListener(changedVolumeEvent, (e: CustomEventInit) => {
      this.updateState({ volume: e.detail.volume });
    });
  }

  handlePlayerProgressBarClicked() {
    window.addEventListener(progressBarClickedEvent, (e: CustomEventInit) => {
      const percentage = e.detail.progressBarClickPosition;
      const specificSecond = percentage * this.props.audioManager!.duration!;

      this.updateState({ isPlaying: e.detail.isPlaying });
      this.props.audioManager?.playFromSecond(specificSecond);
      this.props.player?.handlePlayPauseButtonUI(e.detail.isPlaying);
      this.props.player?.handleUpdateProgressBarUI(specificSecond, percentage);
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
    window.addEventListener(songEndedEvent, () => {
      this.handlePlayerProgressBarInterval(true);
      this.props.audioManager?.stop();
      this.props.player?.handlePlayPauseButtonUI(false);
      this.updateState({ isPlaying: false });
      this.props.player?.handleUpdateProgressBarUI(0, 0);
    });
  }

  handleSongChanged() {
    window.addEventListener(songChangedEvent, () => {
      this.props.player!.handleTotalDurationSpan(this.props.audioManager!.duration!);
    });
  }

  // Songs Panel

  handleSongPanelEvents() {
    this.handleAddNewSong();
  }

  handleAddNewSong() {
    window.addEventListener(songUploadedEvent, ({ detail }: CustomEventInit<Song>) => {
      const found = this._state.songList.findIndex((song) => song.id === detail!.id) !== -1;

      if (found) {
        this.props.songPanel?.handlePostFormSubmission(false);
        return;
      }

      this.updateState({
        songList: [...this._state.songList, detail!],
        currentSong: this.lastSongListIndex + 1,
      });

      this.props.songPanel?.handlePostFormSubmission(true);
    });
  }

  // Properties Panel

  handlePropertiesPanelEvents() {
    this.handleSceneIndex();
    this.handleSceneChangeTheme();
    this.handleRotationCheckbox();
    this.handlePanCheckbox();
    this.handleZoomCheckbox();
    this.handleAddCustomTheme();
  }

  handleSceneIndex() {
    window.addEventListener(changedSceneIndexEvent, (e: CustomEventInit) => {
      this.updateState({ sceneIndex: e.detail.sceneIndex });
      this.props.sceneManager!.setCurrentScene(this._state.sceneIndex);
      this.props.sceneManager!.setCurrentThemeIndex(this._state.themeIndex);
      const schema = this.props.sceneManager!.currentScene.scheme();
      this.props.propertiesPanel!.handleSceneSchemeChanged(schema);
    });
  }

  handleSceneChangeTheme() {
    window.addEventListener(changedThemeIndexEvent, (e: CustomEventInit) => {
      this.updateState({ themeIndex: e.detail.themeIndex });
      this.props.sceneManager!.currentScene?.changeTheme(this._state.themeIndex);
      this.props.sceneManager!.setCurrentThemeIndex(this._state.themeIndex);
    });
  }

  handleRotationCheckbox() {
    window.addEventListener(changedRotationCheckboxEvent, (e: CustomEventInit) => {
      this.updateState({ rotationEnabled: e.detail.rotationEnabled });
      this.props.orbitControls!.enableRotate = this._state.rotationEnabled;
    });
  }

  handlePanCheckbox() {
    window.addEventListener(changedPanCheckboxEvent, (e: CustomEventInit) => {
      this.updateState({ panEnabled: e.detail.panEnabled });
      this.props.orbitControls!.enablePan = this._state.panEnabled;
    });
  }

  handleZoomCheckbox() {
    window.addEventListener(changedZoomCheckboxEvent, (e: CustomEventInit) => {
      this.updateState({ zoomEnabled: e.detail.zoomEnabled });
      this.props.orbitControls!.enableZoom = this._state.zoomEnabled;
    });
  }

  handleAddCustomTheme() {
    window.addEventListener(AddedNewThemeEvent, ({ detail }: CustomEventInit<Theme>) => {
      const isFound = this._state.themes.findIndex((theme) => theme.name === detail!.name);
      if (isFound !== -1) return;

      this.updateState({
        themes: [...this._state.themes, detail!],
        themeIndex: this.lastThemeIndex + 1,
      });
      this.handlePopulateThemesDropdown();
      this.props.propertiesPanel?.handleSelectThemeIndex(this._state.themeIndex);
    });
  }

  // Events

  initializeEventHandlers() {
    this.handlePlayerEvents();
    this.handleSongPanelEvents();
    this.handlePropertiesPanelEvents();
    this.handleKeyboardEvents();
    this.handleWindowResize();
  }

  handleWindowResize() {
    window.addEventListener("resize", () => {
      this.updateState({
        width: this.props.canvasContainer.getBoundingClientRect().width || 0,
        height: this.props.canvasContainer.getBoundingClientRect().height || 0,
      });
      this.props.camera!.aspect = this._state.width / this._state.height;
      this.props.camera!.updateProjectionMatrix();
      this.props.renderer!.setSize(this._state.width, this._state.height);
    });
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
          if (this.state.isAnimationRunning) {
            this.props.renderer!.setAnimationLoop(null);
            this.updateState({ isAnimationRunning: false });
          } else {
            this.props.renderer!.setAnimationLoop(this.props.updateFn!);
            this.updateState({ isAnimationRunning: true });
          }
          break;
        default:
          break;
      }
    });
  }
}
