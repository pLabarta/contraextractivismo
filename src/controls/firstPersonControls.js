import * as THREE from 'three';

export class FirstPersonControls {
    constructor(camera, domElement, model = null) {
        this.camera = camera;
        this.domElement = domElement;
        this.model = model;

        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.rotateLeft = false;
        this.rotateRight = false;

        // Movement settings
        this.moveSpeed = 0.02;
        this.lookSpeed = 0.002;
        this.keyboardRotateSpeed = 0.03;

        // Gravity and physics
        this.gravity = -0.003;
        this.verticalVelocity = 0;
        this.isOnGround = false;
        this.playerHeight = 0.1; // Height of the player's "feet" above ground

        // Mouse look state
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.isLocked = false;

        // Store original camera state
        this.originalPosition = new THREE.Vector3();
        this.originalRotation = new THREE.Euler();
        this.originalLookAt = new THREE.Vector3();

        // Movement direction vector
        this.direction = new THREE.Vector3();
        this.velocity = new THREE.Vector3();

        // Raycaster for ground detection
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 10; // Maximum distance to check for ground

        // Bind event handlers
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onPointerLockChange = this.onPointerLockChange.bind(this);
        this.onPointerLockError = this.onPointerLockError.bind(this);
    }

    setModel(model) {
        this.model = model;
    }

    saveOriginalState() {
        this.originalPosition.copy(this.camera.position);
        this.originalRotation.copy(this.camera.rotation);
    }

    restoreOriginalState() {
        this.camera.position.copy(this.originalPosition);
        this.camera.rotation.copy(this.originalRotation);
        this.euler.setFromQuaternion(this.camera.quaternion);
    }

    positionAtModelCenter() {
        if (!this.model) return;

        // Calculate the bounding box of the model
        const box = new THREE.Box3().setFromObject(this.model);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Position camera above the center of the model
        this.camera.position.set(center.x, center.y + 2, center.z);

        // Reset vertical velocity
        this.verticalVelocity = 0;
        this.isOnGround = false;

        // Reset camera rotation to look straight ahead
        this.euler.set(0, 0, 0);
        this.camera.quaternion.setFromEuler(this.euler);
    }

    enable() {
        this.saveOriginalState();

        // Position player at model center
        this.positionAtModelCenter();

        // Add event listeners
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('pointerlockchange', this.onPointerLockChange);
        document.addEventListener('pointerlockerror', this.onPointerLockError);

        // Request pointer lock
        this.domElement.requestPointerLock();

        // Set initial euler from camera
        this.euler.setFromQuaternion(this.camera.quaternion);

        this.isLocked = true;
    }

    disable() {
        // Remove event listeners
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('pointerlockchange', this.onPointerLockChange);
        document.removeEventListener('pointerlockerror', this.onPointerLockError);

        // Exit pointer lock
        if (document.pointerLockElement === this.domElement) {
            document.exitPointerLock();
        }

        // Reset movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.rotateLeft = false;
        this.rotateRight = false;

        this.isLocked = false;

        // Restore original state
        this.restoreOriginalState();
    }

    onPointerLockChange() {
        if (document.pointerLockElement === this.domElement) {
            document.addEventListener('mousemove', this.onMouseMove);
        } else {
            document.removeEventListener('mousemove', this.onMouseMove);
        }
    }

    onPointerLockError() {
        console.error('Pointer lock error');
    }

    onMouseMove(event) {
        if (!this.isLocked) return;

        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        this.euler.setFromQuaternion(this.camera.quaternion);

        this.euler.y -= movementX * this.lookSpeed;
        this.euler.x -= movementY * this.lookSpeed;

        // Limit pitch rotation
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

        this.camera.quaternion.setFromEuler(this.euler);
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'KeyA':
                this.rotateLeft = true;
                break;
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'KeyD':
                this.rotateRight = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'KeyA':
                this.rotateLeft = false;
                break;
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'KeyD':
                this.rotateRight = false;
                break;
        }
    }

    checkGround() {
        if (!this.model) return false;

        // Cast ray downward from camera position
        this.raycaster.set(
            this.camera.position,
            new THREE.Vector3(0, -1, 0)
        );

        // Get all meshes from the model
        const meshes = [];
        this.model.traverse((child) => {
            if (child.isMesh) {
                meshes.push(child);
            }
        });

        const intersections = this.raycaster.intersectObjects(meshes, false);

        if (intersections.length > 0) {
            const distance = intersections[0].distance;
            return { isOnGround: distance <= this.playerHeight + 0.01, distance };
        }

        return { isOnGround: false, distance: Infinity };
    }

    update() {
        if (!this.isLocked) return;

        // Handle rotation with A/D keys
        if (this.rotateLeft) {
            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y += this.keyboardRotateSpeed;
            this.camera.quaternion.setFromEuler(this.euler);
        }
        if (this.rotateRight) {
            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= this.keyboardRotateSpeed;
            this.camera.quaternion.setFromEuler(this.euler);
        }

        // Apply gravity
        this.verticalVelocity += this.gravity;

        // Check ground collision
        const groundCheck = this.checkGround();
        this.isOnGround = groundCheck.isOnGround;

        // If on ground, stop falling and maintain height
        if (this.isOnGround) {
            this.verticalVelocity = 0;
            // Adjust position to maintain player height above ground
            if (groundCheck.distance < this.playerHeight) {
                this.camera.position.y += (this.playerHeight - groundCheck.distance);
            }
        }

        // Apply vertical velocity
        this.camera.position.y += this.verticalVelocity;

        // Handle forward/backward movement with W/S keys (flipped: positive z moves forward)
        this.direction.z = Number(this.moveBackward) - Number(this.moveForward);
        this.direction.normalize();

        if (this.moveForward || this.moveBackward) {
            this.velocity.z = this.direction.z * this.moveSpeed;
        } else {
            this.velocity.z = 0;
        }

        // Apply movement relative to camera direction
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        this.camera.position.addScaledVector(forward, -this.velocity.z);
    }
}
