import "./styles.scss";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import ChaoticScene from "./scenes/chaoticScene";
import AudioManager from "./audioManager";
import StateManager, { type Song } from "./stateManager";
import Player from "./player";
import SongPanel from "./songPanel";
import PropertiesPanel from "./propertiesPanel";
import { randomID } from "./utils";

const canvasContainer = document.querySelector(".canvas-container");
const songsFolder = "/public/songs/";

const songs = [
  {
    id: randomID("System of a Down", "Forest.mp3"),
    artistName: "System of a Down",
    songName: "Forest.mp3",
  },
  {
    id: randomID("Therion", "Clavicula Nox.mp3"),
    artistName: "Therion",
    songName: "Clavicula Nox.mp3",
  },
];

const songList: Song[] = songs.map((song) => ({
  src: songsFolder + song.artistName + " - " + song.songName,
  ...song,
}));

const stateManager = new StateManager({
  canvasContainer,
  isAnimationRunning: false,
  songList,
  rotationEnabled: true,
  panEnabled: true,
  zoomEnabled: true,
});

const numberOfFrequencies = 512 * (2 * 2);
const audioManager = new AudioManager(songList, numberOfFrequencies);
audioManager.setSong(stateManager.state.currentSong);
audioManager.volume = stateManager.state.volume;

const scene = new ChaoticScene(numberOfFrequencies);
scene.position.set(0, -0, 0);

const light = new T.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, -10);
light.target.position.set(0, 0, 0);
scene.add(light);

const camera = new T.PerspectiveCamera(
  75,
  stateManager.state.WIDTH / stateManager.state.HEIGHT,
  0.1,
  2000
);

camera.position.set(0, 0, 1200);
camera.lookAt(scene.position);

const renderer = new T.WebGLRenderer();

renderer.setSize(stateManager.state.WIDTH, stateManager.state.HEIGHT);
canvasContainer?.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.enableRotate = stateManager.state.rotationEnabled;
orbitControls.enablePan = stateManager.state.panEnabled;
orbitControls.enableZoom = stateManager.state.zoomEnabled;

function update(_t?: number) {
  renderer.render(scene, camera);
  scene.rotation.z = -_t! / 10000;
  scene.animate(audioManager.fft);
  orbitControls.update();
}

const player = new Player(stateManager);
const songPanel = new SongPanel(stateManager);
const propertiesPanel = new PropertiesPanel(stateManager);

stateManager.addProperty("audioManager", audioManager);
stateManager.addProperty("camera", camera);
stateManager.addProperty("orbitControls", orbitControls);
stateManager.addProperty("player", player);
stateManager.addProperty("songPanel", songPanel);
stateManager.addProperty("propertiesPanel", propertiesPanel);
stateManager.addProperty("renderer", renderer);
stateManager.addProperty("currentScene", scene);
stateManager.addProperty("updateFn", update);
stateManager.handlePropertiesPanelSetup();
stateManager.initializeEventHandlers();

if (stateManager.state.isAnimationRunning) {
  renderer.setAnimationLoop(update);
}
