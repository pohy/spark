import { Tags } from '../tags';
import {
    Group,
    Mesh,
    PointLight,
    Scene,
    Math,
    MeshPhongMaterial,
    BoxGeometry,
    PerspectiveCamera,
} from 'three';
import { GameObject, Taggable, UUID } from './game-object';
import { keyboardState } from '../input/keyboard-state';

export class Player implements GameObject, Taggable, UUID {
    private moveSpeed: number = 5;
    private sprintMultiplier: number = 2;
    private rotationSpeed: number = 100;
    private playerMesh: Mesh;
    private flashlight: PointLight;
    private playerWithLight: Group;

    constructor(scene: Scene, camera: PerspectiveCamera) {
        this.rotationSpeed = 100;

        this.playerMesh = Player.createPlayerMesh();
        this.flashlight = Player.createFlashlight();

        camera.position.y = 5;
        camera.position.z = -5;

        this.playerWithLight = new Group();
        this.playerWithLight.add(this.playerMesh);
        this.playerWithLight.add(this.flashlight);
        this.playerWithLight.add(camera);
        this.playerWithLight.position.y += 0.5;
        scene.add(this.playerWithLight);
        return this;
    }

    update(delta: number) {
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
            Math.degToRad(rotationSpeed) * rotationMultiplier * delta;

        if (up && !down) {
            playerWithLight.translateZ(currentMoveSpeed);
        }
        if (down && !up) {
            playerWithLight.translateZ(-currentMoveSpeed);
        }
        if (left && !right) {
            playerWithLight.rotateY(currentRotation);
        }
        if (right && !left) {
            playerWithLight.rotateY(-currentRotation);
        }
    }

    get tags() {
        return [Tags.Player];
    }

    get uuid() {
        return this.playerMesh.uuid;
    }

    private static createPlayerMesh() {
        const geometry = new BoxGeometry(0.5, 1, 0.3, 1, 1, 1);
        const faceMaterials = [
            new MeshPhongMaterial({ color: 0x3333ff }),
            new MeshPhongMaterial({ color: 0x3333ff }),
            new MeshPhongMaterial({ color: 0x3333ff }),
            new MeshPhongMaterial({ color: 0x3333ff }),
            new MeshPhongMaterial({ color: 0xffff33 }),
            new MeshPhongMaterial({ color: 0x3333ff }),
        ];
        const playerMesh = new Mesh(geometry, faceMaterials);
        playerMesh.castShadow = true;
        playerMesh.receiveShadow = true;
        return playerMesh;
    }

    private static createFlashlight() {
        const light = new PointLight(0xffffff);
        light.position.y = 2;
        light.position.z = 2;
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        return light;
    }
}