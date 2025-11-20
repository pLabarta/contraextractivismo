import { createScene, createCamera, createRenderer, createLights, setupResizeHandler } from './scene/sceneSetup.js';
import { createMeshBackground, updateMeshBackground } from './background/meshBackground.js';
import { loadModel, updateModelProgress, rotateModel } from './model/modelLoader.js';
import { LoadingDisplay } from './ui/loadingDisplay.js';
import { showTables, hideTables } from './ui/metalTables.js';
import { ANIMATION } from './config.js';

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
    },
    (error) => {
        console.error('Failed to load model:', error);
    }
);

// Flag to track if we've switched to original texture
let hasShownOriginalTexture = false;

// Button event listeners
const showResultsBtn = document.getElementById('showResultsBtn');
const closeTablesBtn = document.getElementById('closeTablesBtn');

showResultsBtn.addEventListener('click', () => {
    showTables();
});

closeTablesBtn.addEventListener('click', () => {
    hideTables();
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

        // Show the results button
        showResultsBtn.style.display = 'block';
    }

    // Rotate the model on all enabled axes
    if (model) {
        rotateModel(model, ANIMATION.modelRotation);
    }

    // Camera animation (if enabled)
    if (ANIMATION.camera.enabled) {
        const angle = elapsed * ANIMATION.camera.rotationSpeed;
        const verticalOffset = Math.sin(elapsed * ANIMATION.camera.verticalSpeed) * ANIMATION.camera.verticalAngle;

        camera.position.x = Math.sin(angle) * ANIMATION.camera.orbitRadius;
        camera.position.z = Math.cos(angle) * ANIMATION.camera.orbitRadius;
        camera.position.y = verticalOffset;
        camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
}

// Setup window resize handling
setupResizeHandler(camera, renderer);

// Start animation
animate();
