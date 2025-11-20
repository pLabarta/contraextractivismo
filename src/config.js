// Color constants
export const COLORS = {
    background: 0x0a0a0a,
    yellow: 0xf4e4a8,
    meshDark: 0x3d2f1a,
    meshLight: 0x6b5635
};

// Animation settings
export const ANIMATION = {
    loadingDuration: 30000, // 30 seconds in milliseconds
    // Model rotation speeds per axis (use negative values to reverse direction)
    modelRotation: {
        x: 0,     // Rotation around X axis (pitch) - positive = forward tilt
        y: 0,  // Rotation around Y axis (yaw) - positive = counterclockwise from above
        z: 0.003      // Rotation around Z axis (roll) - positive = clockwise
    },
    camera: {
        enabled: false,  // Enable camera rotation/orbit
        rotationSpeed: 0.001,  // Speed of camera rotation around model
        orbitRadius: 3.5,  // Distance from center
        verticalAngle: 0,  // Vertical angle in radians (0 = level with model)
        verticalSpeed: 0  // Speed of vertical oscillation (0 = no movement)
    }
};

// Background mesh settings
export const MESH_BACKGROUND = {
    size: 50,
    segments: 100,
    position: { x: 0, y: 0, z: -8 },
    wave: {
        speed: 0.15,
        amplitude: 2.0
    },
    grid: {
        size: 20.0,
        lineWidth: 0.015,
        nodeRadius: 0.08
    }
};

// Camera settings
export const CAMERA = {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 0, z: 3.5 },
    rotation: { x: 0, y: 0, z: 0 },  // Initial camera rotation (radians)
    lookAt: { x: 0, y: 0, z: 0 }  // Point the camera looks at
};

// Lighting settings
export const LIGHTS = {
    ambient: {
        color: 0xffffff,
        intensity: 0.5
    },
    directional: {
        color: 0xffffff,
        intensity: 0.8,
        position: { x: 5, y: 5, z: 5 }
    },
    top: {
        color: 0xffffff,
        intensity: 1.0,
        position: { x: 0, y: 10, z: 0 }
    }
};

// Model settings
export const MODEL = {
    path: '../motherboardscan.fbx',
    // Initial rotation (radians) - determines how model is oriented at start
    rotation: {
        x: -1,  // Tilt up/down (0 = flat, Math.PI/6 = tilted, Math.PI/2 = standing)
        y: 0,  // Rotate left/right - animation will add to this
        z: 0   // Roll rotation
    },
    position: { x: 0, y: -1, z: 0 },  // Model position in scene
    scale: {
        targetSize: 3  // Max dimension in units (1.5x of original 2)
    }
};

// Renderer settings
export const RENDERER = {
    antialias: true,
    maxPixelRatio: 2
};
