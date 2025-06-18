import "./styles.scss";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import VisualizerScene from "./scene";
import AudioManager from "./audioManager";
import ThemeManager from "./themeManager";
import {
  stateChangedName,
  playSongName,
  changedVolumeName,
  pauseSongName,
} from "./Events";
import Player from "./player";

let STATE = {
  isPlaying: false,
  volume: 0.5,
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
audioManager.setSong(1);
audioManager.volume = STATE.volume;

const allowZRotation = false;

const themeManager = new ThemeManager(
  "chaotic",
  new T.Color(0x2607a6),
  new T.Color(0x5500ff)
);

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

const player = new Player();

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

window.addEventListener(playSongName, () => {
  if (STATE.isPlaying) {
    audioManager.play();
  }
});

window.addEventListener(pauseSongName, () => {
  if (!STATE.isPlaying) {
    audioManager.pause();
  }
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
      console.log(audioManager.fft);
      console.log(scene.children);
      console.log(scene.position);
      break;
    default:
      break;
  }
});
