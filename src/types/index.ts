import type { Color, WebGLRenderer, PerspectiveCamera, Group } from "three";
import type AudioManager from "../audioManager";
import type PlayerType from "../player";
import type SongPanelType from "../songPanel";
import type PropertiesPanel from "../propertiesPanel";
import type { OrbitControls } from "three/examples/jsm/Addons.js";
import type SceneManager from "../sceneManager";
import CustomScene from "../customScene";
import type CanvasPanel from "../canvasPanel";

type HTMLInputTypes =
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

export type Schema = {
  id: string;
  localStorageId: string;
  name: string;
  type: HTMLInputTypes;
  order: number;
  required: HTMLInputElement["required"];
  defaultValue: string | number;
  textContent: string;
  minValue?: string | number;
  maxValue?: string | number;
  eventProvider: (groups: Group[]) => (e: Event) => void;
  eventHandler: (e: Event) => void;
};

export type Song = {
  id: string;
  artistName: string;
  songName: string;
  fileName: string;
  src?: string;
};

export type Theme = {
  name: string;
  color: Color;
  transitionColor: Color;
  backgroundColor: Color;
};

export type State = {
  isFPSCounterShowing: boolean;
  isUpdating: boolean;
  isAnimationRunning: boolean;
  songList: Song[];
  rotationEnabled: boolean;
  panEnabled: boolean;
  zoomEnabled: boolean;
  sceneIndex: number;
  themeIndex: number;
  numberOfFrequencies: number;
  themes: Theme[];
  currentSong: number;
  volume: number;
  width: number;
  height: number;
  isPlaying: boolean;
  playerProgressBarInterval: number;
  sceneInputProperties: [];
};

export type StateManagerChildren = {
  player: PlayerType;
  songPanel: SongPanelType;
  propertiesPanel: PropertiesPanel;
  canvasPanel: CanvasPanel;
  fpsCounter: Stats;
};

type PerssitedValue = { value: any; set: (newValue: any) => void };

export type PersistedValues = {
  isAnimationRunning: PerssitedValue;
  rotationEnabled: PerssitedValue;
  panEnabled: PerssitedValue;
  zoomEnabled: PerssitedValue;
  volume: PerssitedValue;
  sceneIndex: PerssitedValue;
  themeIndex: PerssitedValue;
  themes: PerssitedValue;
};

export type StateManagerProps = {
  canvasContainer: HTMLDivElement;
  audioManager: AudioManager;
  sceneManager: SceneManager;
  camera: PerspectiveCamera;
  orbitControls: OrbitControls;
  renderer: WebGLRenderer;
  updateFn: () => void;
  state: State;
  persistedValues: PersistedValues;
} & StateManagerChildren;

export type Scene = {
  name: string;
  scene: CustomScene;
};

export type SceneManagerProps = {
  scenes: Scene[];
  index: number;
};

export type ConstructedFFT = {
  reloadFFT: () => void;
  fft: Uint8Array<ArrayBuffer>;
};
