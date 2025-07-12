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
  element?: HTMLInputElement;
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

export type StateManagerProps = {
  audioManager?: AudioManager;
  sceneManager?: SceneManager;
  orbitControls?: OrbitControls;
  isAnimationRunning: boolean;
  sceneIndex: number;
  themeIndex: number;
  rotationEnabled: boolean;
  panEnabled: boolean;
  zoomEnabled: boolean;
  themes: Theme[];
  renderer?: WebGLRenderer;
  camera?: PerspectiveCamera;
  updateFn?: () => void;
  songList: Song[];
  player?: PlayerType;
  songPanel?: SongPanelType;
  propertiesPanel?: PropertiesPanel;
  canvasContainer: Element | null;
};

export type StateManagerState = {
  WIDTH: number;
  HEIGHT: number;
  isPlaying: Boolean;
  volume: number;
  currentSong: number;
  sceneIndex: number;
  themeIndex: number;
  isAnimationRunning: boolean;
  rotationEnabled: boolean;
  panEnabled: boolean;
  zoomEnabled: boolean;
  playerProgressBarInterval: number;
  songList: Song[];
  themes: Theme[];
};

export type Scene = {
  name: string;
  sceneClass: typeof CustomScene;
};

export type SceneManagerProps = {
  scenes: Scene[];
  index: number;
  numberOfFrequencies: number;
  themes: Theme[];
  currentThemeIndex: number;
};
