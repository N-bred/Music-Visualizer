import type { WebGLRenderer, PerspectiveCamera } from "three";
import {
  stateChangedName,
  changedVolumeName,
  nextSongName,
  previousSongName,
  changedSongStateName,
} from "./Events";
import type AudioManager from "./audioManager";
import type VisualizerScene from "./scene";
import type Player from "./player";

type StateManagerProps = {
  audioManager?: AudioManager;
  scene?: VisualizerScene;
  isAnimationRunning: boolean;
  renderer?: WebGLRenderer;
  camera?: PerspectiveCamera;
  updateFn?: () => void;
  songList: string[];
  player?: Player;
  canvasContainer: Element | null;
};

type StateManagerState = {
  WIDTH: number;
  HEIGHT: number;
  isPlaying: Boolean;
  volume: number;
  currentSong: number;
  isAnimationRunning: boolean;
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
    };
  }

  get state() {
    return this._state;
  }

  init() {
    this.handleStateChanged();
    this.handlePlayerEvents();
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
      this._state = { ...this._state, ...this.props.player!.state };
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
      await this.props.audioManager!.setSong(this._state.currentSong);
      this.props.player!.handlePlayPauseButtonUI(true);
      this.props.audioManager!.play();
    });
  }

  handlePlayerNextSong() {
    window.addEventListener(nextSongName, async () => {
      this.props.audioManager!.pause();
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

  handleKeyboardEvents() {
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "q":
          this.props.scene!.animatePanel(this.props.audioManager!.fft);
          break;
        case "d":
          console.log(this.props.player!.state);
          console.log(this.props.songList);
          console.log(this.props.audioManager);
          break;
        case "p":
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
