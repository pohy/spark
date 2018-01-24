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
            this.emissiveMaterialHex = this.tree.material.uniforms.emissive.value.getHex();

            this.tree.position.set(x, y, z);
            this.tree.rotateY(degToRad(Math.random() * 360));
            this.scene.add(this.tree);
        }

        update(delta) {
            this.tree.material.uniforms.time.value += delta;
            this.tree.material.needsUpdate = true;
            this.handleInitialGrowth(delta);
            this.handleHighlight();
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

        handleHighlight() {
            if (
                this.rooted &&
                this.highlighted.current &&
                !this.highlighted.next
            ) {
                this.highlighted.current = false;
                this.tree.material.uniforms.emissive.value.setHex(
                    this.emissiveMaterialHex,
                );
            }
            if (this.rooted && this.highlighted.next) {
                this.highlighted.current = true;
                this.highlighted.next = false;
                this.tree.material.uniforms.emissive.value.setHex(
                    this.highlightColor,
                );
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
        const uniforms = THREE.UniformsUtils.merge([
            THREE.ShaderLib.lambert.uniforms,
            {
                diffuse: {
                    value: new THREE.Color(Math.random(), 1, Math.random()),
                },
                time: {
                    type: 'f',
                    value: 0,
                },
            },
        ]);
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: TreeShaders.vertex,
            fragmentShader: TreeShaders.fragment,
            lights: true,
        });
        const cubeMesh = new THREE.Mesh(geometry, shaderMaterial);
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        return cubeMesh;
    }
})();
