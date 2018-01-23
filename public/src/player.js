(function() {
    'use strict';

    window.Player = class Player {
        constructor(scene) {
            this.moveSpeed = 5;
            this.sprintMultiplier = 2;
            this.rotationSpeed = 100;

            this.playerMesh = createPlayerMesh();
            this.flashlight = createFlashlight();

            this.playerWithLight = new THREE.Group();
            this.playerWithLight.add(this.playerMesh);
            this.playerWithLight.add(this.flashlight);
            scene.add(this.playerWithLight);
        }

        update(delta) {
            const {
                moveSpeed,
                rotationSpeed,
                playerWithLight,
                sprintMultiplier,
            } = this;
            const { left, right, up, down, sprint } = keyboardState();

            const moveSpeedMultiplier = sprint ? sprintMultiplier : 1;
            const currentMoveSpeed = moveSpeed * moveSpeedMultiplier * delta;

            const rotationMultiplier = !up && !down ? 2 : 1.5;
            const currentRotation =
                degToRad(rotationSpeed) * rotationMultiplier * delta;

            if (up && !down) {
                playerWithLight.translateZ(currentMoveSpeed);
            }
            if (down && !up) {
                playerWithLight.translateZ(-currentMoveSpeed);
            }
            if (left && !right) {
                playerWithLight.rotation.y += currentRotation;
            }
            if (right && !left) {
                playerWithLight.rotation.y -= currentRotation;
            }
        }
    };

    function createPlayerMesh() {
        const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
        const faceMaterials = [
            new THREE.MeshPhongMaterial({ color: 0x3333ff }),
            new THREE.MeshPhongMaterial({ color: 0x3333ff }),
            new THREE.MeshPhongMaterial({ color: 0x3333ff }),
            new THREE.MeshPhongMaterial({ color: 0x3333ff }),
            new THREE.MeshPhongMaterial({ color: 0xffff33 }),
            new THREE.MeshPhongMaterial({ color: 0x3333ff }),
        ];
        const material = new THREE.MeshFaceMaterial(faceMaterials);
        const playerMesh = new THREE.Mesh(geometry, material);
        playerMesh.castShadow = true;
        playerMesh.receiveShadow = true;
        return playerMesh;
    }

    function createFlashlight() {
        const light = new THREE.PointLight(0xffffff);
        light.position.y = 2;
        light.position.z = 2;
        light.castShadow = true;
        light.shadowCameraVisible = true;
        light.shadowDarkness = 0.75;
        return light;
    }
})();
