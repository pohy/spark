(function() {
    'use strict';

    window.Tree = class Tree {
        /**
         * Spawns a new tree
         * @param {THREE.Scene} scene
         * @param {THREE.Vector3} position
         */
        constructor(scene, { x, y, z }) {
            this.rooted = false;
            this.growRate = 3;
            this.scene = scene;
            this.highlighted = {
                next: false,
                current: false,
            };
            this.highlightColor = 0x333333;
            this.tree = createCube();
            this.emissiveMaterialHex = this.tree.material.emissive.getHex();

            this.tree.position.set(x, y, z);
            this.tree.rotateY(degToRad(Math.random() * 360));
            this.scene.add(this.tree);
        }

        update(delta) {
            this.handleInitialGrowth(delta);
            this.handlHighlighting();
        }

        handleInitialGrowth(delta) {
            const { left } = mouseState();
            if (!this.rooted && !left) {
                this.rooted = true;
            }
            if (!this.rooted && left) {
                const {
                    scale: { x, y, z },
                    geometry: { parameters: { height } },
                } = this.tree;
                const currentGrowRate = this.growRate * delta;
                this.tree.scale.set(
                    x + currentGrowRate,
                    y + currentGrowRate,
                    z + currentGrowRate,
                );
                this.tree.position.y = height * this.tree.scale.y / 2;
            }
        }

        handlHighlighting() {
            if (
                this.rooted &&
                this.highlighted.current &&
                !this.highlighted.next
            ) {
                this.highlighted.current = false;
                this.tree.material.emissive.setHex(this.emissiveMaterialHex);
            }
            if (this.rooted && this.highlighted.next) {
                this.highlighted.current = true;
                this.highlighted.next = false;
                this.tree.material.emissive.setHex(this.highlightColor);
            }
        }

        highlight() {
            this.highlighted.next = true;
        }

        remove() {
            this.scene.remove(this.tree);
        }

        get tags() {
            return [TAGS.TREE];
        }

        get uuid() {
            return this.tree.uuid;
        }
    };

    function createCube() {
        const geometry = new THREE.CubeGeometry(1, 1, 1);
        const color = new THREE.Color(Math.random(), 1, Math.random());
        const material = new THREE.MeshPhongMaterial({
            color: color.getHex(),
        });
        const cubeMesh = new THREE.Mesh(geometry, material);
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        return cubeMesh;
    }
})();
