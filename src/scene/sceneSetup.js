import * as THREE from 'three';
import { COLORS, CAMERA, LIGHTS, RENDERER } from '../config.js';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);
    return scene;
}

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        CAMERA.fov,
        window.innerWidth / window.innerHeight,
        CAMERA.near,
        CAMERA.far
    );
    camera.position.set(CAMERA.position.x, CAMERA.position.y, CAMERA.position.z);
    camera.rotation.set(CAMERA.rotation.x, CAMERA.rotation.y, CAMERA.rotation.z);
    camera.lookAt(CAMERA.lookAt.x, CAMERA.lookAt.y, CAMERA.lookAt.z);
    return camera;
}

export function createRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: RENDERER.antialias
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDERER.maxPixelRatio));
    return renderer;
}

export function createLights(scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
        LIGHTS.ambient.color,
        LIGHTS.ambient.intensity
    );
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
        LIGHTS.directional.color,
        LIGHTS.directional.intensity
    );
    directionalLight.position.set(
        LIGHTS.directional.position.x,
        LIGHTS.directional.position.y,
        LIGHTS.directional.position.z
    );
    scene.add(directionalLight);

    // Top light
    const topLight = new THREE.DirectionalLight(
        LIGHTS.top.color,
        LIGHTS.top.intensity
    );
    topLight.position.set(
        LIGHTS.top.position.x,
        LIGHTS.top.position.y,
        LIGHTS.top.position.z
    );
    scene.add(topLight);

    return { ambientLight, directionalLight, topLight };
}

export function setupResizeHandler(camera, renderer) {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
