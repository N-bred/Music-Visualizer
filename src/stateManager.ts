import type { WebGLRenderer, PerspectiveCamera } from "three";
import {
  stateChangedName,
  changedVolumeName,
  nextSongName,
  previousSongName,
  changedSongStateName,
  changedSongIndexName,
  changedThemeIndexName,
  changedSceneIndexName,
  songUploadedName,
  changedRotationCheckboxName,
  changedPanCheckboxName,
  changedZoomCheckboxName,
} from "./Events";
import type AudioManager from "./audioManager";
import type PlayerType from "./player";
import type SongPanelType from "./songPanel";
import type PropertiesPanel from "./propertiesPanel";
import type { OrbitControls } from "three/examples/jsm/Addons.js";
import type SceneManager from "./sceneManager";

export type Song = {
  id: string;
  artistName: string;
  songName: string;
  src?: string;
};

type StateManagerProps = {
  audioManager?: AudioManager;
  sceneManager?: SceneManager;
  orbitControls?: OrbitControls;
  isAnimationRunning: boolean;
  sceneIndex: number;
  rotationEnabled: boolean;
  panEnabled: boolean;
  zoomEnabled: boolean;
  renderer?: WebGLRenderer;
  camera?: PerspectiveCamera;
  updateFn?: () => void;
  songList: Song[];
  player?: PlayerType;
  songPanel?: SongPanelType;
  propertiesPanel?: PropertiesPanel;
  canvasContainer: Element | null;
};

type StateManagerState = {
  WIDTH: number;
  HEIGHT: number;
  isPlaying: Boolean;
  volume: number;
  currentSong: number;
  sceneIndex: number;
  isAnimationRunning: boolean;
  rotationEnabled: boolean;
  panEnabled: boolean;
  zoomEnabled: boolean;
  songList: Song[];
};

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
      isAnimationRunning: this.props.isAnimationRunning,
      rotationEnabled: this.props.rotationEnabled,
      panEnabled: this.props.rotationEnabled,
      zoomEnabled: this.props.zoomEnabled,
      songList: this.props.songList,
    };
  }

  get state() {
    return this._state;
  }

  set currentSong(song: number) {
    this._state.currentSong = song;
  }

  initializeEventHandlers() {
    this.handleStateChanged();
    this.handlePlayerEvents();
    this.handleSongPanelEvents();
    this.handlePropertiesPanelEvents();
    this.handleKeyboardEvents();
    this.handleWindowResize();
  }

  addProperty<K extends keyof StateManagerProps>(
    key: K,
    property: StateManagerProps[K]
  ) {
    this.props[key] = property;
  }

  handleWindowResize() {
    window.addEventListener("resize", () => {
      this._state.WIDTH =
        this.props.canvasContainer?.getBoundingClientRect().width || 0;
      this._state.HEIGHT =
        this.props.canvasContainer?.getBoundingClientRect().height || 0;
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
    window.addEventListener(changedSongStateName, () => {
      if (this._state.isPlaying) {
        this.props.audioManager!.play();
      } else {
        this.props.audioManager!.pause();
      }
    });
  }

  handlePlayerPreviousSong() {
    window.addEventListener(previousSongName, async () => {
      this.props.audioManager!.pause();
      this.props.songPanel?.handleSongListStyles(this._state.currentSong);
      await this.props.audioManager!.setSong(this._state.currentSong);
      this.props.player!.handlePlayPauseButtonUI(true);
      this.props.audioManager!.play();
    });
  }

  handlePlayerNextSong() {
    window.addEventListener(nextSongName, async () => {
      this.props.audioManager!.pause();
      this.props.songPanel?.handleSongListStyles(this._state.currentSong);
      await this.props.audioManager!.setSong(this._state.currentSong);
      this.props.player!.handlePlayPauseButtonUI(true);
      this.props.audioManager!.play();
    });
  }

  handlePlayerVolumeChanged() {
    window.addEventListener(changedVolumeName, () => {
      this.props.audioManager!.volume = this._state.volume;
    });
  }

  handlePlayerEvents() {
    this.handlePlayerChangedSong();
    this.handlePlayerNextSong();
    this.handlePlayerPreviousSong();
    this.handlePlayerVolumeChanged();
  }

  handleSongPanelSongIndexChanged() {
    window.addEventListener(changedSongIndexName, async () => {
      this.props.audioManager!.pause();
      await this.props.audioManager!.setSong(this._state.currentSong);
      this.props.player!.handlePlayPauseButtonUI(true);
      this._state.isPlaying = true;
      this.props.audioManager!.play();
    });
  }

  handleAddNewSong() {
    window.addEventListener(songUploadedName, () => {
      const found =
        this.state.songList.findIndex(
          (song) => song.id === this.props.songPanel!._state.id
        ) !== -1;

      if (found) {
        this.props.songPanel?.handlePostFormSubmission(false);
        return;
      }

      this.state.songList.push({ ...this.props.songPanel!._state });
      this.props.songPanel?.handlePostFormSubmission(true);
    });
  }

  handleSongPanelEvents() {
    this.handleSongPanelSongIndexChanged();
    this.handleAddNewSong();
  }

  handleSceneIndex() {
    window.addEventListener(changedSceneIndexName, () => {
      this.props.sceneManager!.setCurrentScene(
        this.props.propertiesPanel!.state.sceneIndex
      );
    });
  }

  handleSceneChangeTheme() {
    window.addEventListener(changedThemeIndexName, () => {
      this.props.sceneManager!.currentScene?.changeTheme(
        this.props.propertiesPanel!.state.themeIndex
      );
    });
  }

  handlePropertiesPanelEvents() {
    this.handleSceneIndex();
    this.handleSceneChangeTheme();
    this.handleRotationCheckbox();
    this.handlePanCheckbox();
    this.handleZoomCheckbox();
  }

  handlePopulateThemesDropdown() {
    this.props.propertiesPanel?.populateThemesDropdown(
      this.props.sceneManager!.currentScene!.themes
    );
  }

  handlePopulateScenesDropdown() {
    this.props.propertiesPanel?.populateScenesDropdown(
      this.props.sceneManager!.scenes
    );
  }

  handleRotationCheckbox() {
    window.addEventListener(changedRotationCheckboxName, () => {
      this._state.rotationEnabled =
        this.props.propertiesPanel!.state.rotationEnabled;
      this.props.orbitControls!.enableRotate = this._state.rotationEnabled;
    });
  }

  handlePanCheckbox() {
    window.addEventListener(changedPanCheckboxName, () => {
      this._state.panEnabled = this.props.propertiesPanel!.state.panEnabled;
      this.props.orbitControls!.enablePan = this._state.panEnabled;
    });
  }

  handleZoomCheckbox() {
    window.addEventListener(changedZoomCheckboxName, () => {
      this._state.zoomEnabled = this.props.propertiesPanel!.state.zoomEnabled;
      this.props.orbitControls!.enableZoom = this._state.zoomEnabled;
    });
  }

  handlePropertiesPanelSetup() {
    this.handlePopulateThemesDropdown();
    this.handlePopulateScenesDropdown();
  }

  handleKeyboardEvents() {
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "d":
          console.log(this._state);
          console.log(this.currentSong);
          console.log(this.props.propertiesPanel?.state.sceneIndex);
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
