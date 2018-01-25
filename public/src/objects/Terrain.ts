import { GameObject, Taggable, UUID } from './object';
import {
    Mesh,
    Scene,
    Math as ThreeMath,
    PlaneGeometry,
    MeshDepthMaterial,
    MeshPhongMaterial,
} from 'three';
const SimplexNoise = require('simplex-noise');
import { Tags } from '../tags';

export class Terrain implements GameObject, Taggable, UUID {
    update(delta: number): void {}
    private scene: Scene;
    private terrain: Mesh;

    constructor(scene: Scene) {
        this.scene = scene;
        this.terrain = Terrain.generateTerrainPlane();

        console.log(this.terrain);
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

    private static generateTerrainPlane() {
        const simplex = new SimplexNoise();
        const geometry = new PlaneGeometry(100, 100, 100, 100);
        for (let i = 0; i < geometry.vertices.length; i++) {
            const { x, y } = geometry.vertices[i];
            const noiseValue = simplex.noise2D(x / 10, y / 10);
            geometry.vertices[i].z = ThreeMath.mapLinear(
                noiseValue,
                -1,
                1,
                -1,
                3,
            );
            geometry.verticesNeedUpdate = true;
        }
        const material = new MeshPhongMaterial({
            wireframe: false,
            color: 0xfaff30,
        });
        const mesh = new Mesh(geometry, material);
        mesh.receiveShadow = true;
        // mesh.castShadow = true;
        mesh.rotateX(ThreeMath.degToRad(270));
        return mesh;
    }
}
