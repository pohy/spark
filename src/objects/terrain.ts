import { GameObject } from './game-object';
import {
    Mesh,
    Scene,
    Math as ThreeMath,
    PlaneGeometry,
    ShaderMaterial,
    ShaderLib,
    UniformsUtils,
} from 'three';
const SimplexNoise = require('simplex-noise');
import { Tags } from '../tags';
const vertexShader = require('../shaders/terrain-vertex-shader.glsl');
const fragmentShader = require('../shaders/terrain-fragment-shader.glsl');

export class Terrain implements GameObject {
    private scene: Scene;
    private terrain: Mesh;
    private seed: number;
    private simplex: any;

    public static width = 500;
    public static depth = 500;
    public static scale = 90;
    public static heightMin = -9;
    public static heightMax = 25;
    public static waterLevel = -4;
    public static snowLevel = 23;

    constructor(scene: Scene) {
        this.scene = scene;
        this.seed = Math.random();
        this.simplex = new SimplexNoise(() => this.seed);
        this.terrain = this.generateTerrainPlane();

        scene.add(this.terrain);
    }

    update(delta: number): void {}

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
        const noiseValue = this.simplex.noise2D(
            x / Terrain.scale,
            y / Terrain.scale,
        );
        return ThreeMath.mapLinear(
            noiseValue,
            -1,
            1,
            Terrain.heightMin,
            Terrain.heightMax,
        );
    }

    private generateTerrainPlane() {
        const geometry = new PlaneGeometry(
            Terrain.width,
            Terrain.depth,
            100,
            100,
        );
        geometry.rotateX(ThreeMath.degToRad(270));
        for (let i = 0; i < geometry.vertices.length; i++) {
            const { x, z } = geometry.vertices[i];
            geometry.vertices[i].y = this.positionHeight(x, z);
        }
        geometry.computeVertexNormals();
        geometry.verticesNeedUpdate = true;
        const uniforms = UniformsUtils.merge([
            ShaderLib.phong.uniforms,
            {
                time: { type: 'f', value: 0 },
                heightMax: { type: 'f', value: Terrain.heightMax },
                heightMin: { type: 'f', value: Terrain.heightMin },
                waterLevel: { type: 'f', value: Terrain.waterLevel },
                snowLevel: { type: 'f', value: Terrain.snowLevel },
            },
        ]);
        const shaderMaterial = new ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            lights: true,
        });
        const mesh = new Mesh(geometry, shaderMaterial);
        mesh.receiveShadow = true;
        return mesh;
    }
}
