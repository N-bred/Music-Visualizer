import { OrbitControls } from "three/examples/jsm/Addons.js";
import "./style.css";
import * as T from "three";
import VisualizerScene from "./scene";
import AudioManager from "./audioManager";

const appContainer = document.querySelector("#app");
const songsFolder = "public/songs/";
const songNames = ["System of a Down - Forest.mp3"];

const songList = songNames.map((song) => songsFolder + song);
const numberOfFrequencies = 512 * 2;
const audioManager = new AudioManager(songList, numberOfFrequencies);
audioManager.setSong(0);
audioManager.volume = 0.5;

const scene = new VisualizerScene();
scene.instantiatePanel(numberOfFrequencies, "y");
scene.instantiateLight();
scene.position.set(150, -100, 0);

const camera = new T.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
camera.position.set(0, 0, -150);

const renderer = new T.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
appContainer?.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

function update(_t?: number) {
  renderer.render(scene, camera);
  scene.animatePanel(audioManager.fft);
  orbitControls.update();
}

renderer.setAnimationLoop(update);

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "q":
      scene.animatePanel(audioManager.fft);
      break;
    case "p":
      if (audioManager.isPlaying) {
        audioManager.pause();
      } else {
        audioManager.play();
      }
      break;
    case "d":
      console.log(audioManager.fft);
      console.log(scene.children)
      break;
    default:
      break;
  }
});
