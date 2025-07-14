import "./styles.scss";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import AudioManager from "./audioManager";
import StateManager from "./stateManager";
import SceneManager from "./sceneManager";
import ChaoticScene from "./scenes/chaoticScene";
import FlatCircleScene from "./scenes/flatCircle";
import Player from "./player";
import SongPanel from "./songPanel";
import PropertiesPanel from "./propertiesPanel";
import { createSongList, randomID, useLocalStorage } from "./utils/utils";
import type { PersistedValues, Song, State, Theme } from "./types";

const canvasContainer = document.querySelector(".canvas-container")! as HTMLDivElement;

const DEFAULT_THEMES: Theme[] = [
  {
    name: "Purple",
    color: new T.Color(0x2607a6),
    transitionColor: new T.Color(0x5500ff),
    backgroundColor: new T.Color(0x000000),
  },
  {
    name: "Pink",
    color: new T.Color(0xff00ff),
    transitionColor: new T.Color(0x00ff00),
    backgroundColor: new T.Color(0x000000),
  },
];

const SONGS_FOLDER = "/public/songs/";

const DEFAULT_SONGS: Song[] = [
  {
    id: randomID("System of a Down", "Forest"),
    artistName: "System of a Down",
    songName: "Forest",
    fileName: "Forest.mp3",
  },
  {
    id: randomID("Therion", "Clavicula Nox"),
    artistName: "Therion",
    songName: "Clavicula Nox",
    fileName: "Clavicula Nox.mp3",
  },
];

const songList = createSongList(DEFAULT_SONGS, SONGS_FOLDER);

const PERSISTED_VALUES: PersistedValues = {
  rotationEnabled: useLocalStorage<boolean>("rotationEnabled", true),
  panEnabled: useLocalStorage<boolean>("panEnabled", true),
  zoomEnabled: useLocalStorage<boolean>("zoomEnabled", true),
  volume: useLocalStorage<number>("volume", 0.5),
};

const DEFAULT_STATE: State = {
  isAnimationRunning: false,
  songList,
  rotationEnabled: PERSISTED_VALUES.rotationEnabled.value,
  panEnabled: PERSISTED_VALUES.panEnabled.value,
  zoomEnabled: PERSISTED_VALUES.zoomEnabled.value,
  sceneIndex: 0,
  themeIndex: 0,
  numberOfFrequencies: 1024 * 2,
  themes: DEFAULT_THEMES,
  currentSong: 0,
  volume: PERSISTED_VALUES.volume.value,
  width: canvasContainer.getBoundingClientRect().width || 0,
  height: canvasContainer.getBoundingClientRect().height || 0,
  isPlaying: false,
  playerProgressBarInterval: 0,
  sceneInputProperties: [],
};

const audioManager = new AudioManager(DEFAULT_STATE.songList, DEFAULT_STATE.numberOfFrequencies);
audioManager.setSong(DEFAULT_STATE.currentSong);
audioManager.volume = DEFAULT_STATE.volume;

const sceneManager = new SceneManager({
  scenes: [
    { name: "Chaotic", scene: new ChaoticScene(DEFAULT_STATE.numberOfFrequencies, DEFAULT_STATE.themes, DEFAULT_STATE.themeIndex) },
    {
      name: "Flat Circle",
      scene: new FlatCircleScene(DEFAULT_STATE.numberOfFrequencies, DEFAULT_STATE.themes, DEFAULT_STATE.themeIndex),
    },
  ],
  index: DEFAULT_STATE.sceneIndex,
});
sceneManager.currentScene.position.set(0, -0, 0);

const light = new T.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, -10);
light.target.position.set(0, 0, 0);
sceneManager.currentScene.add(light);

const camera = new T.PerspectiveCamera(75, DEFAULT_STATE.width / DEFAULT_STATE.height, 0.1, 2000);
camera.position.set(0, 0, 1200);
camera.lookAt(sceneManager.currentScene.position);

const renderer = new T.WebGLRenderer();
renderer.setSize(DEFAULT_STATE.width, DEFAULT_STATE.height);
canvasContainer?.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.enableRotate = DEFAULT_STATE.rotationEnabled;
orbitControls.enablePan = DEFAULT_STATE.panEnabled;
orbitControls.enableZoom = DEFAULT_STATE.zoomEnabled;

let delta = 0;

function update() {
  renderer.render(sceneManager.currentScene, camera);
  sceneManager.currentScene.animate(audioManager.fft, delta);
  orbitControls.update();
  delta += 0.1;
}

const stateManager = new StateManager({
  state: { ...DEFAULT_STATE },
  persistedValues: PERSISTED_VALUES,

  // Helpers
  canvasContainer,
  audioManager,
  sceneManager,
  camera,
  orbitControls,
  renderer,
  updateFn: update,

  // Children
  player: new Player({
    currentSong: DEFAULT_STATE.currentSong,
    songList: DEFAULT_STATE.songList,
  }),
  songPanel: new SongPanel({
    currentSong: DEFAULT_STATE.currentSong,
    songList: DEFAULT_STATE.songList,
  }),
  propertiesPanel: new PropertiesPanel(),
});

let firstRender = false;

while (!firstRender) {
  update();
  firstRender = true;
}

if (stateManager.state.isAnimationRunning) {
  renderer.setAnimationLoop(update);
}
