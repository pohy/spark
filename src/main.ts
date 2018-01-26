import {
    AmbientLight,
    BackSide,
    BoxGeometry,
    Clock,
    DoubleSide,
    Intersection,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Raycaster,
    Scene,
    Vector3,
    WebGLRenderer,
} from 'three';
const Stats = require('stats.js');
import { mouseStateSetRelativeElement, mouseState } from './input/mouse-state';
import { Tags } from './tags';
import { Player } from './objects/player';
import { Tree } from './objects/tree';
import { GameObject } from './objects/game-object';
import { Terrain } from './objects/terrain';
import { Keyboard } from './input/keyboard';

declare global {
    interface Window {
        currentAnimationFrameID: number;
    }
}

const gameEl = document.createElement('canvas');
gameEl.id = 'game';
const width = 1280,
    height = 720;

const stats = new Stats();
document.body.appendChild(stats.dom);

const clock = new Clock();
const scene = new Scene();
const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);

const renderer = new WebGLRenderer({
    canvas: gameEl,
    antialias: true,
});
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
const existingRenderer = document.getElementById('game');
if (existingRenderer) {
    document.body.replaceChild(renderer.domElement, existingRenderer);
} else {
    document.body.appendChild(renderer.domElement);
}
renderer.domElement.focus();
renderer.domElement.addEventListener('contextmenu', (event) =>
    event.preventDefault(),
);
Keyboard.getInstance().onUp(['KeyR'], () => location.reload(true));

mouseStateSetRelativeElement(renderer.domElement);

const raycaster = new Raycaster();

const ambientLight = new AmbientLight(0x444444);

let objects: GameObject[] = [new Player(scene, camera), new Terrain(scene)];

scene.add(ambientLight);

scene.add(createSkyBox());

let wasClicked = false;

if (window.currentAnimationFrameID) {
    window.cancelAnimationFrame(window.currentAnimationFrameID);
}

animate();

function animate() {
    const delta = clock.getDelta();

    update(delta);
    render();

    stats.update();
    window.currentAnimationFrameID = window.requestAnimationFrame(animate);
}

function update(delta: number) {
    const {
        position,
        position: { x: mouseX, y: mouseY },
        left,
        right,
    } = mouseState();
    raycaster.setFromCamera(position, camera);
    const hoveredObjects = findHoveredObjects(raycaster);
    const hoveredTree = <Tree>hoveredObjects.find(objectByTag(Tags.Tree));
    if (hoveredTree) {
        hoveredTree.highlight();
    }
    if (left && !wasClicked && !hoveredTree) {
        wasClicked = true;
        spawnNewTree(raycaster);
    } else if (right && !wasClicked && hoveredTree) {
        wasClicked = true;
        removeClickedTree(hoveredTree);
    } else if (!left && !right && wasClicked) {
        wasClicked = false;
    }
    const dampFactor = 7;
    camera.lookAt(new Vector3(-mouseX * dampFactor, mouseY * dampFactor, 0.5));
    objects.forEach((object) => object.update(delta));
}

function render() {
    renderer.render(scene, camera);
}

function spawnNewTree(raycaster: Raycaster) {
    const terrain = <Terrain>objects.find(objectByTag(Tags.Terrain));
    if (!terrain) {
        return;
    }
    const intersects = raycaster.intersectObject(terrain.mesh);
    if (intersects.length <= 0) {
        return;
    }
    const { x, y, z } = intersects[0].point;
    objects.push(new Tree(scene, new Vector3(x, y + 0.5, z)));
}

function removeClickedTree(treeForRemoval: Tree) {
    treeForRemoval.remove();
    objects = objects.filter(
        (object) => (<Tree>object).uuid !== treeForRemoval.uuid,
    );
}

function findHoveredObjects(raycaster: Raycaster) {
    return raycaster
        .intersectObjects(scene.children)
        .map(uuidFromIntersect)
        .map((uuid) => objects.find(objectByUUID(uuid)))
        .filter((object) => !!object);
}

function uuidFromIntersect({ object: { uuid } }: Intersection) {
    return uuid;
}

function objectByTag(tag: Tags) {
    return ({ tags }: any) => tags.includes(tag);
}

function objectByUUID(uuid: string) {
    return ({ uuid: objectUUID }: any) => uuid === objectUUID;
}

function createSkyBox() {
    const geometry = new BoxGeometry(900, 900, 900);
    const material = new MeshBasicMaterial({
        color: 0x9999ff,
        side: BackSide,
    });
    return new Mesh(geometry, material);
}

function createPlane() {
    const geometry = new PlaneGeometry(50, 50);
    const material = new MeshPhongMaterial({
        color: 0xa9a9a9,
        side: DoubleSide,
    });
    return new Mesh(geometry, material);
}
