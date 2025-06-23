import "./styles.scss";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import VisualizerScene from "./scene";
import AudioManager from "./audioManager";
import ThemeManager from "./themeManager";
import Player from "./player";
import StateManager from "./stateManager";

const canvasContainer = document.querySelector(".canvas-container");
const songsFolder = "public/songs/";
const songNames = ["System of a Down - Forest.mp3", "Clavicula Nox.mp3"];
const songList = songNames.map((song) => songsFolder + song);
const stateManager = new StateManager({
  canvasContainer,
  isAnimationRunning: true,
  songList,
});

const numberOfFrequencies = 512 * (2 * 2);
const audioManager = new AudioManager(songList, numberOfFrequencies);
audioManager.setSong(stateManager.state.currentSong);
audioManager.volume = stateManager.state.volume;

new ThemeManager("chaotic", new T.Color(0x2607a6), new T.Color(0x5500ff));

const scene = new VisualizerScene();
scene.instantiatePanel(numberOfFrequencies, "y");
scene.instantiatePanel(numberOfFrequencies, "y");
scene.instantiateLight();
scene.position.set(0, -0, 0);

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

function update(_t?: number) {
  renderer.render(scene, camera);
  scene.rotation.z = -_t! / 10000;
  scene.animatePanel(audioManager.fft);
  orbitControls.update();
}

const player = new Player(songList);

stateManager.addProperty("audioManager", audioManager);
stateManager.addProperty("camera", camera);
stateManager.addProperty("player", player);
stateManager.addProperty("renderer", renderer);
stateManager.addProperty("scene", scene);
stateManager.addProperty("updateFn", update);
stateManager.init();

if (stateManager.state.isAnimationRunning) {
  renderer.setAnimationLoop(update);
}
