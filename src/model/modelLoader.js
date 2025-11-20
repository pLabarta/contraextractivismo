import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
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

    const loader = new FBXLoader();

    loader.load(
        MODEL.path,
        (fbxObject) => {
            console.log('FBX loaded successfully:', fbxObject);

            // Apply rotation to fbxObject first to get correct orientation
            fbxObject.rotation.x = MODEL.rotation.x;
            fbxObject.rotation.y = MODEL.rotation.y;

            // Update matrices to apply rotation before calculating bounds
            fbxObject.updateMatrixWorld(true);

            // Calculate bounding box and scale AFTER rotation
            const box = new THREE.Box3().setFromObject(fbxObject);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = MODEL.scale.targetSize / maxDim;

            // Create a wrapper group for transforms
            const wrapper = new THREE.Group();

            // Reset fbxObject rotation (will be applied via wrapper)
            fbxObject.rotation.set(0, 0, 0);

            // Position the FBX object to center it within the wrapper
            fbxObject.position.set(-center.x, -center.y, -center.z);
            wrapper.add(fbxObject);

            // Apply scale, rotation, and position to the wrapper
            wrapper.scale.setScalar(scale);
            wrapper.rotation.x = MODEL.rotation.x;
            wrapper.rotation.y = MODEL.rotation.y;
            wrapper.rotation.z = MODEL.rotation.z;
            wrapper.position.set(MODEL.position.x, MODEL.position.y, MODEL.position.z);

            // Store original materials for later toggle
            const originalMaterials = new Map();
            fbxObject.traverse((child) => {
                if (child.isMesh) {
                    originalMaterials.set(child, child.material);
                }
            });

            // Create merged geometry version with shader material
            const geometries = [];
            fbxObject.traverse((child) => {
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
                console.error('No meshes found in FBX file');
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
            fbxObject.traverse((child) => {
                if (child.isMesh) {
                    child.material = shaderMaterial;
                }
            });

            scene.add(wrapper);

            if (onLoad) onLoad(wrapper, shaderMaterial, originalMaterials, fbxObject);
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
