import { GameObject } from './game-object';
import {
    BoxGeometry,
    Color,
    Math as ThreeMath,
    Mesh,
    Scene,
    ShaderLib,
    ShaderMaterial,
    UniformsUtils,
    Vector3,
} from 'three';
import { mouseState } from '../input/mouse-state';
import { Tags } from '../tags';
const vertexShader = require('../shaders/tree-vertex-shader.glsl');
const fragmentShader = require('../shaders/tree-fragment-shader.glsl');

export class Tree implements GameObject {
    private scene: Scene;
    private tree: Mesh;
    private rooted: boolean = false;
    private growRate: number = 3;
    private highlighted: { next: boolean; current: boolean } = {
        next: false,
        current: false,
    };
    private highlightColor: number = 0x333333;
    private emissiveMaterialHex: number;
    private delta: number = 1;

    constructor(scene: Scene, position: Vector3, normal?: Vector3) {
        this.scene = scene;
        this.tree = Tree.createCube();
        this.tree.position.copy(position);
        this.tree.lookAt(
            normal
                ? normal
                : new Vector3(Math.random(), Math.random(), Math.random()),
        );
        const shaderMaterial = <ShaderMaterial>this.tree.material;
        this.emissiveMaterialHex = shaderMaterial.uniforms.emissive.value.getHex();

        this.tree.rotateY(ThreeMath.degToRad(Math.random() * 360));
        this.scene.add(this.tree);
    }

    update(delta: number) {
        this.delta = delta;
        const shaderMaterial = <ShaderMaterial>this.tree.material;
        shaderMaterial.uniforms.time.value += delta;
        shaderMaterial.needsUpdate = true;
        this.handleInitialGrowth(delta);
        this.handleHighlight();
    }

    public highlight() {
        this.highlighted.next = true;
    }

    public remove(): Promise<void> {
        return new Promise((resolve) => {
            let shrinkMultiplier = 2;
            const intervalID = setInterval(() => {
                const { tree: { scale: { x, y, z } } } = this;
                if (x <= 0) {
                    clearInterval(intervalID);
                    resolve();
                    this.scene.remove(this.tree);
                }
                const currentShrinkRate =
                    (this.growRate + shrinkMultiplier) * 3 * this.delta;
                this.tree.scale.set(
                    x - currentShrinkRate,
                    y - currentShrinkRate,
                    z - currentShrinkRate,
                );
                shrinkMultiplier += Math.random() / 2;
            }, 10);
        });
    }

    get tags() {
        return [Tags.Tree];
    }

    get uuid() {
        return this.tree.uuid;
    }

    private handleInitialGrowth(delta: number) {
        const { left } = mouseState();
        if (!this.rooted && !left) {
            this.rooted = true;
            this.grow(this.growRate * Math.random());
        }
        if (!this.rooted && left) {
            this.grow(this.growRate * delta);
        }
    }

    private grow(amount: number) {
        const { scale: { x, y, z } } = this.tree;
        this.tree.scale.set(x + amount, y + amount, z + amount);
    }

    private handleHighlight() {
        if (this.rooted && this.highlighted.current && !this.highlighted.next) {
            this.highlighted.current = false;
            const shaderMaterial = <ShaderMaterial>this.tree.material;
            shaderMaterial.uniforms.emissive.value.setHex(
                this.emissiveMaterialHex,
            );
        }
        if (this.rooted && this.highlighted.next) {
            this.highlighted.current = true;
            this.highlighted.next = false;
            const shaderMaterial = <ShaderMaterial>this.tree.material;
            shaderMaterial.uniforms.emissive.value.setHex(this.highlightColor);
        }
    }

    private static createCube() {
        const geometry = new BoxGeometry(1, 1, 1);
        const uniforms = UniformsUtils.merge([
            ShaderLib.lambert.uniforms,
            {
                diffuse: {
                    value: new Color(Math.random(), 1, Math.random()),
                },
                time: {
                    type: 'f',
                    value: 0,
                },
            },
        ]);
        const shaderMaterial = new ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            lights: true,
        });
        const cubeMesh = new Mesh(geometry, shaderMaterial);
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        return cubeMesh;
    }
}
