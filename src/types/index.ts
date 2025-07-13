import type { Color, WebGLRenderer, PerspectiveCamera } from "three";
import type AudioManager from "../audioManager";
import type PlayerType from "../player";
import type SongPanelType from "../songPanel";
import type PropertiesPanel from "../propertiesPanel";
import type { OrbitControls } from "three/examples/jsm/Addons.js";
import type SceneManager from "../sceneManager";
import CustomScene from "../customScene";

export type Schema = {
  name: string;
  type: string;
  order: number;
  required: boolean;
  defaultValue: string;
  textContent: string;
  minValue?: string;
  maxValue?: string;
  onChange: (e: Event) => void;
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
} & StateManagerChildren;

export type Scene = {
  name: string;
  scene: CustomScene;
};

export type SceneManagerProps = {
  scenes: Scene[];
  index: number;
};
