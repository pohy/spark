import { GameObject } from './game-object';
import {
    BoxGeometry,
    Color,
    Math as ThreeMath,
    Mesh,
    MeshPhongMaterial,
    Scene,
    ShaderLib,
    ShaderMaterial,
    UniformsUtils,
    Vector3,
} from 'three';
import { mouseState } from '../input/mouse-state';
import { Tags } from '../common/tags';
import { loadModel } from '../common/load-model';
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

    constructor(scene: Scene, position: Vector3) {
        this.scene = scene;
        this.tree = loadModel(require('../../assets/tree.json'));
        this.tree.castShadow = true;
        this.tree.receiveShadow = true;
        this.tree.position.copy(position);
        const phongMaterial = (this.tree.material as MeshPhongMaterial[])[0];
        this.emissiveMaterialHex = phongMaterial.emissive.getHex();

        this.tree.rotateY(ThreeMath.degToRad(Math.random() * 360));
        this.scene.add(this.tree);

        if (!mouseState().left) {
            this.grow(this.growRate * Math.random());
        }
    }

    update(delta: number) {
        this.delta = delta;
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
        }
        if (!this.rooted && left) {
            this.grow(this.growRate * delta);
        }
    }

    private grow(amount: number) {
        const { scale: { x, y, z } } = this.tree;
        const widthGrowAmount = amount / 2;
        this.tree.scale.set(
            x + widthGrowAmount,
            y + amount,
            z + widthGrowAmount,
        );
    }

    private handleHighlight() {
        if (this.rooted && this.highlighted.current && !this.highlighted.next) {
            this.highlighted.current = false;
            this.setEmissive(this.emissiveMaterialHex);
        }
        if (this.rooted && this.highlighted.next) {
            this.highlighted.current = true;
            this.highlighted.next = false;
            this.setEmissive(this.highlightColor);
        }
    }

    private setEmissive(color: number) {
        (<MeshPhongMaterial[]>this.tree.material).forEach((material) => {
            material.emissive.setHex(color);
        });
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
