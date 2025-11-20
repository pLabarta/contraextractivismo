import * as THREE from 'three';
import { COLORS, MESH_BACKGROUND } from '../config.js';
import backgroundVertexShader from '../shaders/background-vertex.js';
import backgroundFragmentShader from '../shaders/background-fragment.js';

export function createMeshBackground() {
    const material = new THREE.ShaderMaterial({
        vertexShader: backgroundVertexShader,
        fragmentShader: backgroundFragmentShader,
        uniforms: {
            uTime: { value: 0.0 },
            uWaveSpeed: { value: MESH_BACKGROUND.wave.speed },
            uWaveAmplitude: { value: MESH_BACKGROUND.wave.amplitude },
            uColorDark: { value: new THREE.Color(COLORS.meshDark) },
            uColorLight: { value: new THREE.Color(COLORS.meshLight) }
        },
        side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(
        MESH_BACKGROUND.size,
        MESH_BACKGROUND.size,
        MESH_BACKGROUND.segments,
        MESH_BACKGROUND.segments
    );

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
        MESH_BACKGROUND.position.x,
        MESH_BACKGROUND.position.y,
        MESH_BACKGROUND.position.z
    );

    return { mesh, material };
}

export function updateMeshBackground(material, time) {
    material.uniforms.uTime.value = time;
}
