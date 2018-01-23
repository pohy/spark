(function () {
    'use strict';

    window.Player = class Player {
        constructor(scene) {
            this.moveSpeed = 5;
            this.rotationSpeed = 100;

            this.playerMesh = createPlayerMesh();
            this.flashlight = createFlashlight();

            this.playerWithLight = new THREE.Group();
            this.playerWithLight.add(this.playerMesh);
            this.playerWithLight.add(this.flashlight);
            scene.add(this.playerWithLight);
        }

        update(delta) {
            const {moveSpeed, rotationSpeed, playerWithLight} = this;
            const {left, right, up, down} = keyboardState();

            const currentMovement = moveSpeed * delta;

            const rotationMultiplier = (!up && !down) ? 2 : 1.5;
            const currentRotation = degToRad(rotationSpeed) * rotationMultiplier * delta;

            if (up && !down) {
                playerWithLight.translateZ(currentMovement);
            }
            if (down && !up) {
                playerWithLight.translateZ(-currentMovement);
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
            new THREE.MeshPhongMaterial({color: 0x3333ff}),
            new THREE.MeshPhongMaterial({color: 0x3333ff}),
            new THREE.MeshPhongMaterial({color: 0x3333ff}),
            new THREE.MeshPhongMaterial({color: 0x3333ff}),
            new THREE.MeshPhongMaterial({color: 0xffff33}),
            new THREE.MeshPhongMaterial({color: 0x3333ff}),
        ];
        const material = new THREE.MeshFaceMaterial(faceMaterials);
        return new THREE.Mesh(geometry, material);
    }

    function createFlashlight() {
        const light = new THREE.PointLight(0xffffff);
        light.position.y = 1;
        light.position.z = 1;
        return light;
    }
})();
