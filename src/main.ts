import "./styles.scss";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import ChaoticScene from "./scenes/chaoticScene";
import FlatCircleScene from "./scenes/flatCircle";
import AudioManager from "./audioManager";
import StateManager from "./stateManager";
import type { Song, Theme } from "./types";
import Player from "./player";
import SongPanel from "./songPanel";
import PropertiesPanel from "./propertiesPanel";
import { randomID } from "./utils/utils";
import SceneManager from "./sceneManager";

const canvasContainer = document.querySelector(".canvas-container");
const songsFolder = "/public/songs/";

const songs: Song[] = [
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

const songList: Song[] = songs.map((song) => ({
  src: songsFolder + song.artistName + " - " + song.fileName,
  ...song,
}));

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

const stateManager = new StateManager({
  canvasContainer,
  isAnimationRunning: false,
  songList,
  rotationEnabled: true,
  panEnabled: true,
  zoomEnabled: true,
  sceneIndex: 0,
  themeIndex: 0,
  themes: DEFAULT_THEMES,
});

const numberOfFrequencies = 1024;
const audioManager = new AudioManager(songList, numberOfFrequencies);
audioManager.setSong(stateManager.state.currentSong);
audioManager.volume = stateManager.state.volume;

const sceneManager = new SceneManager({
  scenes: [
    { name: "Chaotic", sceneClass: ChaoticScene },
    //{ name: "Flat Circle", sceneClass: FlatCircleScene },
  ],
  index: stateManager.state.sceneIndex,
  numberOfFrequencies,
  themes: stateManager.state.themes,
  currentThemeIndex: stateManager.state.themeIndex,
});

sceneManager.currentScene.position.set(0, -0, 0);

const light = new T.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, -10);
light.target.position.set(0, 0, 0);
sceneManager.currentScene.add(light);

const camera = new T.PerspectiveCamera(75, stateManager.state.WIDTH / stateManager.state.HEIGHT, 0.1, 2000);

camera.position.set(0, 0, 1200);
camera.lookAt(sceneManager.currentScene.position);

const renderer = new T.WebGLRenderer();

renderer.setSize(stateManager.state.WIDTH, stateManager.state.HEIGHT);
canvasContainer?.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.enableRotate = stateManager.state.rotationEnabled;
orbitControls.enablePan = stateManager.state.panEnabled;
orbitControls.enableZoom = stateManager.state.zoomEnabled;

let t = 0;

function update() {
  renderer.render(sceneManager.currentScene, camera);
  sceneManager.currentScene.rotation.z = -t / 100;
  sceneManager.currentScene.animate(audioManager.fft);
  orbitControls.update();

  t += 0.1;
}

let firstRender = false;

while (!firstRender) {
  update();
  firstRender = true;
}

const player = new Player(stateManager);
const songPanel = new SongPanel(stateManager);
const propertiesPanel = new PropertiesPanel();

stateManager.addProperty("audioManager", audioManager);
stateManager.addProperty("camera", camera);
stateManager.addProperty("orbitControls", orbitControls);
stateManager.addProperty("player", player);
stateManager.addProperty("songPanel", songPanel);
stateManager.addProperty("propertiesPanel", propertiesPanel);
stateManager.addProperty("renderer", renderer);
stateManager.addProperty("sceneManager", sceneManager);
stateManager.addProperty("updateFn", update);
stateManager.initializeEventHandlers();
stateManager.handlePropertiesPanelSetup();
stateManager.handleSongsPanelSetup();

if (stateManager.state.isAnimationRunning) {
  renderer.setAnimationLoop(update);
}
