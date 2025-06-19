import "./styles.scss";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import VisualizerScene from "./scene";
import AudioManager from "./audioManager";
import ThemeManager from "./themeManager";
import {
  stateChangedName,
  changedVolumeName,
  nextSongName,
  previousSongName,
  changedSongStateName,
} from "./Events";
import Player from "./player";

let STATE = {
  isPlaying: false,
  volume: 0.5,
  currentSong: 0,
};

const canvasContainer = document.querySelector(".canvas-container");

const canvasSize = {
  WIDTH: canvasContainer?.getBoundingClientRect().width || 0,
  HEIGHT: canvasContainer?.getBoundingClientRect().height || 0,
};

const songsFolder = "public/songs/";
const songNames = ["System of a Down - Forest.mp3", "Clavicula Nox.mp3"];

const songList = songNames.map((song) => songsFolder + song);
const numberOfFrequencies = 512 * (2 * 2);
const audioManager = new AudioManager(songList, numberOfFrequencies);
audioManager.setSong(STATE.currentSong);
audioManager.volume = STATE.volume;

const allowZRotation = false;

new ThemeManager("chaotic", new T.Color(0x2607a6), new T.Color(0x5500ff));

const scene = new VisualizerScene();
scene.instantiatePanel(numberOfFrequencies, "y");
scene.instantiatePanel(numberOfFrequencies, "y");
scene.instantiateLight();
scene.position.set(0, -0, 0);

const camera = new T.PerspectiveCamera(
  75,
  canvasSize.WIDTH / canvasSize.HEIGHT,
  0.1,
  2000
);
camera.position.set(0, 0, 1200);
camera.lookAt(scene.position);

const renderer = new T.WebGLRenderer();
renderer.setSize(canvasSize.WIDTH, canvasSize.HEIGHT);
canvasContainer?.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const player = new Player(songList);

let isAnimationRunning = true;

function update(_t?: number) {
  renderer.render(scene, camera);
  scene.rotation.z = -_t! / 10000;
  if (allowZRotation) {
    scene.rotation.x = Math.sin(-_t! / 100000) * 1;
  }
  scene.animatePanel(audioManager.fft);
  orbitControls.update();
}

renderer.setAnimationLoop(update);

// EVENTS

window.addEventListener("resize", () => {
  canvasSize.WIDTH = canvasContainer?.getBoundingClientRect().width || 0;
  canvasSize.HEIGHT = canvasContainer?.getBoundingClientRect().height || 0;
  camera.aspect = canvasSize.WIDTH / canvasSize.HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize(canvasSize.WIDTH, canvasSize.HEIGHT);
});

window.addEventListener(stateChangedName, () => {
  STATE = { ...STATE, ...player.state };
});

window.addEventListener(changedSongStateName, () => {
  if (STATE.isPlaying) {
    audioManager.play();
  } else {
    audioManager.pause();
  }
});

window.addEventListener(previousSongName, async () => {
  audioManager.pause();
  await audioManager.setSong(STATE.currentSong);
  player.handlePlayPauseButtonUI(true);
  audioManager.play();
});

window.addEventListener(nextSongName, async () => {
  audioManager.pause();
  await audioManager.setSong(STATE.currentSong);
  player.handlePlayPauseButtonUI(true);
  audioManager.play();
});

window.addEventListener(changedVolumeName, () => {
  audioManager.volume = STATE.volume;
});

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "q":
      scene.animatePanel(audioManager.fft);
      break;
    case "d":
      // console.log(audioManager.fft);
      // console.log(scene.children);
      // console.log(scene.position);
      console.log(player.state);
      console.log(songList);
      console.log(audioManager);
      break;
    case "p":
      if (isAnimationRunning) {
        renderer.setAnimationLoop(null);
        isAnimationRunning = false;
      } else {
        renderer.setAnimationLoop(update);
        isAnimationRunning = true;
      }
      break;
    default:
      break;
  }
});
