import { GameObject, Taggable, UUID } from './object';
import {
    BoxBufferGeometry,
    BoxGeometry,
    BufferGeometry,
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
import TreeShaders from '../shaders/tree-shaders';

export class Tree implements GameObject, Taggable, UUID {
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

    constructor(scene: Scene, { x, y, z }: Vector3) {
        this.scene = scene;
        this.tree = Tree.createCube();
        const shaderMaterial = <ShaderMaterial>this.tree.material;
        this.emissiveMaterialHex = shaderMaterial.uniforms.emissive.value.getHex();

        this.tree.position.set(x, y, z);
        this.tree.rotateY(ThreeMath.degToRad(Math.random() * 360));
        this.scene.add(this.tree);
    }

    update(delta: number) {
        const shaderMaterial = <ShaderMaterial>this.tree.material;
        shaderMaterial.uniforms.time.value += delta;
        shaderMaterial.needsUpdate = true;
        this.handleInitialGrowth(delta);
        this.handleHighlight();
    }

    handleInitialGrowth(delta: number) {
        const { left } = mouseState();
        if (!this.rooted && !left) {
            this.rooted = true;
        }
        if (!this.rooted && left) {
            const { scale: { x, y, z }, geometry } = this.tree;
            const { parameters: { height } } = <BoxGeometry>geometry;
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

    highlight() {
        this.highlighted.next = true;
    }

    remove() {
        this.scene.remove(this.tree);
    }

    get tags() {
        return [Tags.Tree];
    }

    get uuid() {
        return this.tree.uuid;
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
            vertexShader: TreeShaders.vertex,
            fragmentShader: TreeShaders.fragment,
            lights: true,
        });
        const cubeMesh = new Mesh(geometry, shaderMaterial);
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        return cubeMesh;
    }
}
