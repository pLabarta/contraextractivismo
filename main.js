import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// Animated mesh background
const meshBackgroundVertexShader = `
    uniform float uTime;
    uniform float uWaveSpeed;
    uniform float uWaveAmplitude;

    varying vec2 vUv;
    varying float vElevation;

    void main() {
        vUv = uv;

        vec3 pos = position;

        // Create slow moving waves
        float wave1 = sin(pos.x * 0.5 + uTime * uWaveSpeed) * uWaveAmplitude;
        float wave2 = sin(pos.y * 0.3 + uTime * uWaveSpeed * 0.8) * uWaveAmplitude;
        float wave3 = cos(pos.x * 0.3 - pos.y * 0.4 + uTime * uWaveSpeed * 0.6) * uWaveAmplitude * 0.5;

        pos.z = wave1 + wave2 + wave3;
        vElevation = pos.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const meshBackgroundFragmentShader = `
    uniform vec3 uColorDark;
    uniform vec3 uColorLight;

    varying vec2 vUv;
    varying float vElevation;

    void main() {
        // Create gradient based on elevation and position
        float mixStrength = (vElevation + 0.5) * 0.5 + 0.5;
        mixStrength = clamp(mixStrength, 0.0, 1.0);

        // Add some variation based on UV
        float uvMix = (vUv.x + vUv.y) * 0.1;

        vec3 color = mix(uColorDark, uColorLight, mixStrength + uvMix);

        // Create mesh grid with nodes
        float gridSize = 20.0; // Number of grid cells
        vec2 grid = fract(vUv * gridSize);

        // Thin lines
        float lineWidth = 0.015;
        float gridLine = 0.0;
        if (grid.x < lineWidth || grid.x > 1.0 - lineWidth ||
            grid.y < lineWidth || grid.y > 1.0 - lineWidth) {
            gridLine = 0.25;
        }

        // Create nodes at intersections (small circles)
        vec2 nodePos = fract(vUv * gridSize);
        vec2 centerDist = abs(nodePos - vec2(0.0, 0.0));
        vec2 centerDist2 = abs(nodePos - vec2(1.0, 1.0));

        float nodeRadius = 0.08;
        float node = 0.0;

        // Check distance to grid intersections
        if (length(centerDist) < nodeRadius || length(centerDist2) < nodeRadius) {
            node = 0.6;
        }

        // Combine lines and nodes
        float meshIntensity = max(gridLine, node);
        color = mix(color, uColorLight * 1.8, meshIntensity);

        gl_FragColor = vec4(color, 1.0);
    }
`;

const meshBackgroundMaterial = new THREE.ShaderMaterial({
    vertexShader: meshBackgroundVertexShader,
    fragmentShader: meshBackgroundFragmentShader,
    uniforms: {
        uTime: { value: 0.0 },
        uWaveSpeed: { value: 0.15 },
        uWaveAmplitude: { value: 2.0 },
        uColorDark: { value: new THREE.Color(0x3d2f1a) },   // Dark faded yellow/brown - more visible
        uColorLight: { value: new THREE.Color(0x6b5635) }   // Lighter dark yellow/gold - more visible
    },
    side: THREE.DoubleSide
});

const meshBackgroundGeometry = new THREE.PlaneGeometry(50, 50, 100, 100);
const meshBackground = new THREE.Mesh(meshBackgroundGeometry, meshBackgroundMaterial);
meshBackground.position.z = -5;
scene.add(meshBackground);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 4.5;

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Custom shader material
const vertexShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float uProgress;
    uniform vec3 uYellowColor;
    uniform vec3 uBlackColor;
    uniform float uMinX;
    uniform float uMaxX;

    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
        // Calculate the boundary based on progress using actual model bounds
        float boundary = mix(uMinX, uMaxX, uProgress);

        // Determine if this fragment should be yellow or black
        vec3 color = vPosition.x < boundary ? uYellowColor : uBlackColor;

        // Simple lighting based on normal
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diffuse = max(dot(vNormal, lightDir), 0.3);

        gl_FragColor = vec4(color * diffuse, 1.0);
    }
`;

// Create shader material
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uProgress: { value: 0.0 },
        uYellowColor: { value: new THREE.Color(0xf4e4a8) }, // Pale yellow
        uBlackColor: { value: new THREE.Color(0x0a0a0a) },  // Black
        uMinX: { value: -5.0 },
        uMaxX: { value: 5.0 }
    }
});

// Load the STL model
let model = null;
const loader = new STLLoader();

loader.load(
    'motherboard.stl',
    (geometry) => {
        // Compute normals for proper lighting
        geometry.computeVertexNormals();

        // Center and scale the model
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const center = box.getCenter(new THREE.Vector3());

        // Center the geometry by translating vertices
        geometry.translate(-center.x, -center.y, -center.z);

        // Recompute bounding box after centering
        geometry.computeBoundingBox();
        const centeredBox = geometry.boundingBox;
        const size = centeredBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;

        // Create mesh with shader material
        const mesh = new THREE.Mesh(geometry, material);
        model = mesh;

        mesh.scale.setScalar(scale);
        mesh.rotation.x = Math.PI / 6; // 30 degrees tilt
        mesh.rotation.y = Math.PI / 2; // 90 degrees

        // Update shader uniforms with actual model bounds (in local space)
        material.uniforms.uMinX.value = centeredBox.min.x;
        material.uniforms.uMaxX.value = centeredBox.max.x;

        scene.add(mesh);
    },
    undefined,
    (error) => {
        console.error('Error loading model:', error);
    }
);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
topLight.position.set(0, 10, 0);
scene.add(topLight);

// Loading animation
let loadingProgress = 0;
const loadingDuration = 30000; // 30 seconds
const startTime = Date.now();
const percentageElement = document.getElementById('percentage');

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    const elapsed = currentTime - startTime;

    // Update mesh background animation
    meshBackgroundMaterial.uniforms.uTime.value = elapsed * 0.001; // Convert to seconds

    // Update loading progress (0 to 1)
    if (loadingProgress < 1) {
        loadingProgress = Math.min(elapsed / loadingDuration, 1);

        // Update shader uniforms
        if (model && model.material.uniforms) {
            model.material.uniforms.uProgress.value = loadingProgress;
        }

        // Update percentage display
        const percentage = Math.floor(loadingProgress * 100);
        percentageElement.textContent = `${percentage}%`;
    }

    // Rotate the model slowly
    if (model) {
        model.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
