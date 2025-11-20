import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { COLORS, MODEL } from '../config.js';
import modelVertexShader from '../shaders/model-vertex.js';
import modelFragmentShader from '../shaders/model-fragment.js';

export function loadModel(scene, onLoad, onError) {
    const shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: modelVertexShader,
        fragmentShader: modelFragmentShader,
        uniforms: {
            uProgress: { value: 0.0 },
            uYellowColor: { value: new THREE.Color(COLORS.yellow) },
            uBlackColor: { value: new THREE.Color(COLORS.background) },
            uMinX: { value: -5.0 },
            uMaxX: { value: 5.0 }
        }
    });

    const loader = new GLTFLoader();

    loader.load(
        MODEL.path,
        (gltf) => {
            const gltfObject = gltf.scene;
            console.log('GLTF loaded successfully:', gltfObject);

            // Apply rotation to gltfObject first to get correct orientation
            gltfObject.rotation.x = MODEL.rotation.x;
            gltfObject.rotation.y = MODEL.rotation.y;

            // Update matrices to apply rotation before calculating bounds
            gltfObject.updateMatrixWorld(true);

            // Calculate bounding box and scale AFTER rotation
            const box = new THREE.Box3().setFromObject(gltfObject);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = MODEL.scale.targetSize / maxDim;

            // Create a wrapper group for transforms
            const wrapper = new THREE.Group();

            // Reset gltfObject rotation (will be applied via wrapper)
            gltfObject.rotation.set(0, 0, 0);

            // Position the GLTF object to center it within the wrapper
            gltfObject.position.set(-center.x, -center.y, -center.z);
            wrapper.add(gltfObject);

            // Apply scale, rotation, and position to the wrapper
            wrapper.scale.setScalar(scale);
            wrapper.rotation.x = MODEL.rotation.x;
            wrapper.rotation.y = MODEL.rotation.y;
            wrapper.rotation.z = MODEL.rotation.z;
            wrapper.position.set(MODEL.position.x, MODEL.position.y, MODEL.position.z);

            // Store original materials for later toggle
            const originalMaterials = new Map();
            gltfObject.traverse((child) => {
                if (child.isMesh) {
                    originalMaterials.set(child, child.material);
                }
            });

            // Create merged geometry version with shader material
            const geometries = [];
            gltfObject.traverse((child) => {
                if (child.isMesh && child.geometry.attributes.position) {
                    const geom = child.geometry.clone();
                    child.updateWorldMatrix(true, false);
                    geom.applyMatrix4(child.matrixWorld);

                    const cleanGeom = new THREE.BufferGeometry();
                    cleanGeom.setAttribute('position', geom.attributes.position);

                    if (geom.index) {
                        cleanGeom.setIndex(geom.index);
                    }

                    geometries.push(cleanGeom);
                }
            });

            console.log(`Found ${geometries.length} geometries`);

            if (geometries.length === 0) {
                console.error('No meshes found in GLTF file');
                return;
            }

            let combinedGeometry;
            if (geometries.length === 1) {
                combinedGeometry = geometries[0];
            } else {
                combinedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);
            }

            if (!combinedGeometry) {
                console.error('Failed to create combined geometry');
                return;
            }

            combinedGeometry.computeVertexNormals();
            combinedGeometry.computeBoundingBox();

            const centeredBox = combinedGeometry.boundingBox;
            shaderMaterial.uniforms.uMinX.value = centeredBox.min.x;
            shaderMaterial.uniforms.uMaxX.value = centeredBox.max.x;

            // Initially apply shader material to all meshes
            gltfObject.traverse((child) => {
                if (child.isMesh) {
                    child.material = shaderMaterial;
                }
            });

            scene.add(wrapper);

            if (onLoad) onLoad(wrapper, shaderMaterial, originalMaterials, gltfObject);
        },
        undefined,
        (error) => {
            console.error('Error loading model:', error);
            if (onError) onError(error);
        }
    );
}

export function updateModelProgress(material, progress) {
    if (material && material.uniforms) {
        material.uniforms.uProgress.value = progress;
    }
}

export function rotateModel(model, rotationSpeeds) {
    if (model) {
        model.rotation.x += rotationSpeeds.x;
        model.rotation.y += rotationSpeeds.y;
        model.rotation.z += rotationSpeeds.z;
    }
}
