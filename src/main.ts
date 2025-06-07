import { OrbitControls } from "three/examples/jsm/Addons.js";
import "./style.css";
import * as T from "three";
import VisualizerScene from "./scene";

const appContainer = document.querySelector("#app");
const scene = new VisualizerScene();
scene.instantiateBox();
scene.instantiateLight();

const camera = new T.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
camera.position.set(0, 0, -5);
camera.lookAt(new T.Vector3(0, 0, 0));

const renderer = new T.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
appContainer?.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

function update(t?: number) {
  renderer.render(scene, camera);
  orbitControls.update();
}

renderer.setAnimationLoop(update);


window.addEventListener('keyup', e => {
  switch(e.key) {
    case 'q':
      scene.animateBox()
      break
    default:
      break
  }
})