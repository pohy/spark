import { GameObject, Taggable, UUID } from './game-object';
import {
    Mesh,
    Scene,
    Math as ThreeMath,
    PlaneGeometry,
    MeshPhongMaterial,
} from 'three';
const SimplexNoise = require('simplex-noise');
import { Tags } from '../tags';

export class Terrain implements GameObject, Taggable, UUID {
    update(delta: number): void {}
    private scene: Scene;
    private terrain: Mesh;
    private seed: number;
    private simplex: any;
    private static width = 500;
    private static height = 500;

    constructor(scene: Scene) {
        this.scene = scene;
        this.seed = Math.random();
        this.simplex = new SimplexNoise(() => this.seed);
        this.terrain = this.generateTerrainPlane();

        scene.add(this.terrain);
    }

    get uuid() {
        return this.terrain.uuid;
    }

    get tags() {
        return [Tags.Terrain];
    }

    get mesh() {
        return this.terrain;
    }

    public positionHeight(x: number, y: number) {
        const multiplyFactor = 5;
        const smoothness = 70;
        const noiseValue = this.simplex.noise2D(x / smoothness, y / smoothness);
        return ThreeMath.mapLinear(
            noiseValue,
            -1,
            1,
            -1 * multiplyFactor,
            3 * multiplyFactor,
        );
    }

    private generateTerrainPlane() {
        const geometry = new PlaneGeometry(
            Terrain.width,
            Terrain.height,
            100,
            100,
        );
        geometry.rotateX(ThreeMath.degToRad(270));
        for (let i = 0; i < geometry.vertices.length; i++) {
            const { x, z } = geometry.vertices[i];
            geometry.vertices[i].y = this.positionHeight(x, z);
        }
        geometry.verticesNeedUpdate = true;
        const material = new MeshPhongMaterial({
            wireframe: false,
            color: 0xfaff30,
        });
        const mesh = new Mesh(geometry, material);
        mesh.receiveShadow = true;
        return mesh;
    }
}
