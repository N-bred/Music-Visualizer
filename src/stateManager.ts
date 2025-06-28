import type { WebGLRenderer, PerspectiveCamera } from "three";
import {
  stateChangedName,
  changedVolumeName,
  nextSongName,
  previousSongName,
  changedSongStateName,
  changedSongIndexName,
  changedThemeIndexName,
} from "./Events";
import type AudioManager from "./audioManager";
import type PlayerType from "./player";
import type CustomScene from "./customScene";
import type SongPanelType from "./songPanel";
import type PropertiesPanel from "./propertiesPanel";

export type Song = {
  id: string;
  artistName: string;
  songName: string;
  src?: string;
};

type StateManagerProps = {
  audioManager?: AudioManager;
  currentScene?: CustomScene;
  isAnimationRunning: boolean;
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
  isAnimationRunning: boolean;
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
      isAnimationRunning: this.props.isAnimationRunning,
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

  handleAddNewSong(newSong: Song) {
    const found =
      this.state.songList.findIndex((song) => song.id === newSong.id) !== -1;

    if (found) return false;

    this.state.songList.push({ ...newSong });
    return true;
  }

  handleSongPanelEvents() {
    this.handleSongPanelSongIndexChanged();
  }

  handleSceneChangeTheme() {
    window.addEventListener(changedThemeIndexName, () => {
      this.props.currentScene?.changeTheme(
        this.props.propertiesPanel!.state.themeIndex
      );
    });
  }

  handlePropertiesPanelEvents() {
    this.handleSceneChangeTheme();
  }

  handlePopulateThemesDropdown() {
    this.props.propertiesPanel?.populateDropdown(
      this.props.currentScene!.themes
    );
  }

  handlePropertiesPanelSetup() {
    this.handlePopulateThemesDropdown();
  }

  handleKeyboardEvents() {
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "d":
          console.log(this._state);
          console.log(this.currentSong);
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
