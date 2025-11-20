import * as THREE from 'three';
import { createScene, createCamera, createRenderer, createLights, setupResizeHandler } from './scene/sceneSetup.js';
import { createMeshBackground, updateMeshBackground } from './background/meshBackground.js';
import { loadModel, updateModelProgress, rotateModel } from './model/modelLoader.js';
import { LoadingDisplay } from './ui/loadingDisplay.js';
import { showTables, hideTables } from './ui/metalTables.js';
import { FirstPersonControls } from './controls/firstPersonControls.js';
import { ANIMATION, MODEL, DEBUG } from './config.js';

// Initialize scene, camera, and renderer
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer(document.getElementById('canvas'));

// Setup lighting
createLights(scene);

// Create animated mesh background
const { mesh: meshBackground, material: meshMaterial } = createMeshBackground();
scene.add(meshBackground);

// Initialize loading display
const loadingDisplay = new LoadingDisplay('percentage');

// Model reference
let model = null;
let fbxObject = null;
let modelMaterial = null;
let originalMaterials = null;
let isOriginalTexture = false;

// Track start time for animation
const startTime = Date.now();

// Load the 3D model
loadModel(
    scene,
    (loadedModel, material, origMaterials, fbx) => {
        model = loadedModel;
        fbxObject = fbx;
        modelMaterial = material;
        originalMaterials = origMaterials;
        // Set the model for FPS controls
        fpsControls.setModel(fbxObject);
    },
    (error) => {
        console.error('Failed to load model:', error);
    }
);

// Flag to track if we've switched to original texture
let hasShownOriginalTexture = false;

// Initialize first-person controls
const fpsControls = new FirstPersonControls(camera, renderer.domElement);
let isInFPSMode = false;

// Store original model rotation and scale for restoring after FPS mode
let originalModelRotation = { x: 0, y: 0, z: 0 };
let originalModelScale = { x: 1, y: 1, z: 1 };

// FPS mode lighting
let fpsTopLight = null;
let fpsAmbientLight = null;

// Button event listeners
const showResultsBtn = document.getElementById('showResultsBtn');
const closeTablesBtn = document.getElementById('closeTablesBtn');
const enterFPSBtn = document.getElementById('enterFPSBtn');
const exitFPSBtn = document.getElementById('exitFPSBtn');

// Debug panel elements
const fpsDebugPanel = document.getElementById('fpsDebugPanel');
const rotXSlider = document.getElementById('rotX');
const rotYSlider = document.getElementById('rotY');
const rotZSlider = document.getElementById('rotZ');
const rotXValue = document.getElementById('rotXValue');
const rotYValue = document.getElementById('rotYValue');
const rotZValue = document.getElementById('rotZValue');

showResultsBtn.addEventListener('click', () => {
    showTables();
});

closeTablesBtn.addEventListener('click', () => {
    hideTables();
});

// Debug slider event listeners
if (DEBUG.enabled) {
    // Initialize slider values from config
    rotXSlider.value = MODEL.fpsRotation.x;
    rotYSlider.value = MODEL.fpsRotation.y;
    rotZSlider.value = MODEL.fpsRotation.z;
    rotXValue.textContent = MODEL.fpsRotation.x.toFixed(2);
    rotYValue.textContent = MODEL.fpsRotation.y.toFixed(2);
    rotZValue.textContent = MODEL.fpsRotation.z.toFixed(2);

    rotXSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        rotXValue.textContent = value.toFixed(2);
        if (model && isInFPSMode) {
            model.rotation.x = value;
        }
    });

    rotYSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        rotYValue.textContent = value.toFixed(2);
        if (model && isInFPSMode) {
            model.rotation.y = value;
        }
    });

    rotZSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        rotZValue.textContent = value.toFixed(2);
        if (model && isInFPSMode) {
            model.rotation.z = value;
        }
    });
}

enterFPSBtn.addEventListener('click', () => {
    isInFPSMode = true;
    fpsControls.enable();
    enterFPSBtn.style.display = 'none';
    showResultsBtn.style.display = 'none';
    exitFPSBtn.style.display = 'block';

    // Show debug panel if debug mode is enabled
    if (DEBUG.enabled) {
        fpsDebugPanel.style.display = 'block';
    }

    // Save current model rotation and scale, then apply FPS rotation and scale
    if (model) {
        originalModelRotation.x = model.rotation.x;
        originalModelRotation.y = model.rotation.y;
        originalModelRotation.z = model.rotation.z;

        originalModelScale.x = model.scale.x;
        originalModelScale.y = model.scale.y;
        originalModelScale.z = model.scale.z;

        const rotX = parseFloat(rotXSlider.value);
        const rotY = parseFloat(rotYSlider.value);
        const rotZ = parseFloat(rotZSlider.value);

        model.rotation.x = rotX;
        model.rotation.y = rotY;
        model.rotation.z = rotZ;

        // Apply FPS scale multiplier
        model.scale.multiplyScalar(MODEL.fpsScale);
    }

    // Add extra lighting for FPS mode
    if (!fpsTopLight) {
        fpsTopLight = new THREE.DirectionalLight(0xffffff, 2.0);
        fpsTopLight.position.set(0, 50, 0);
        scene.add(fpsTopLight);
    }
    if (!fpsAmbientLight) {
        fpsAmbientLight = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(fpsAmbientLight);
    }
});

exitFPSBtn.addEventListener('click', () => {
    exitFPSMode();
});

// Function to exit FPS mode
function exitFPSMode() {
    if (!isInFPSMode) return;

    isInFPSMode = false;
    fpsControls.disable();
    exitFPSBtn.style.display = 'none';
    enterFPSBtn.style.display = 'block';
    showResultsBtn.style.display = 'block';

    // Hide debug panel
    fpsDebugPanel.style.display = 'none';

    // Restore original model rotation and scale
    if (model) {
        model.rotation.x = originalModelRotation.x;
        model.rotation.y = originalModelRotation.y;
        model.rotation.z = originalModelRotation.z;

        model.scale.x = originalModelScale.x;
        model.scale.y = originalModelScale.y;
        model.scale.z = originalModelScale.z;
    }

    // Remove FPS mode lighting
    if (fpsTopLight) {
        scene.remove(fpsTopLight);
        fpsTopLight = null;
    }
    if (fpsAmbientLight) {
        scene.remove(fpsAmbientLight);
        fpsAmbientLight = null;
    }
}

// Add keyboard listener for Q key to exit FPS mode
document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyQ' && isInFPSMode) {
        exitFPSMode();
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    const elapsed = (currentTime - startTime) * 0.001; // Convert to seconds

    // Update mesh background animation
    updateMeshBackground(meshMaterial, elapsed);

    // Update loading progress
    const progress = loadingDisplay.update();
    updateModelProgress(modelMaterial, progress);

    // Automatically switch to original texture and show button when loading completes
    if (loadingDisplay.isComplete() && !hasShownOriginalTexture && fbxObject && originalMaterials) {
        hasShownOriginalTexture = true;
        fbxObject.traverse((child) => {
            if (child.isMesh) {
                child.material = originalMaterials.get(child);
            }
        });

        // Show both buttons
        showResultsBtn.style.display = 'block';
        enterFPSBtn.style.display = 'block';
    }

    // Update FPS controls if in FPS mode
    if (isInFPSMode) {
        fpsControls.update();
    } else {
        // Rotate the model on all enabled axes (only when not in FPS mode)
        if (model) {
            rotateModel(model, ANIMATION.modelRotation);
        }

        // Camera animation (if enabled and not in FPS mode)
        if (ANIMATION.camera.enabled) {
            const angle = elapsed * ANIMATION.camera.rotationSpeed;
            const verticalOffset = Math.sin(elapsed * ANIMATION.camera.verticalSpeed) * ANIMATION.camera.verticalAngle;

            camera.position.x = Math.sin(angle) * ANIMATION.camera.orbitRadius;
            camera.position.z = Math.cos(angle) * ANIMATION.camera.orbitRadius;
            camera.position.y = verticalOffset;
            camera.lookAt(0, 0, 0);
        }
    }

    renderer.render(scene, camera);
}

// Setup window resize handling
setupResizeHandler(camera, renderer);

// Start animation
animate();
