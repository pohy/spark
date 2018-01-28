import {
    AmbientLight,
    BackSide,
    BoxGeometry,
    Clock,
    Intersection,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Raycaster,
    Scene,
    Vector3,
    WebGLRenderer,
} from 'three';
const Stats = require('stats.js');
import { mouseStateSetRelativeElement, mouseState } from './input/mouse-state';
import { Tags } from './common/tags';
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
    location.reload();
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

const ambientLight = new AmbientLight(0xf1a81c, 0.7);

const terrain = new Terrain(scene);
const player = new Player(scene, camera, terrain);

let objects: GameObject[] = (<Array<GameObject>>[])
    .concat(player, terrain)
    .concat(spawnTrees(terrain, scene));

scene.add(ambientLight);
scene.add(createSkyBox());

let wasClicked = false;
let accumulator = 0;

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
    const { position, left, right } = mouseState();
    raycaster.setFromCamera(position, camera);
    const hoveredObjects = findHoveredObjects(raycaster);
    moveCamera();
    const hoveredTree = <Tree>hoveredObjects.find(objectByTag(Tags.Tree));
    if (hoveredTree) {
        hoveredTree.highlight();
    }
    if (left && !wasClicked && !hoveredTree) {
        wasClicked = true;
        plantTree(raycaster);
    } else if (right && !wasClicked && hoveredTree) {
        wasClicked = true;
        removeClickedTree(hoveredTree);
    } else if (!left && !right && wasClicked) {
        wasClicked = false;
    }
    objects.forEach((object) => object.update(delta));
    // ambientLight.intensity = Math.abs(Math.sin(accumulator / 10));
    accumulator += delta;
}

function moveCamera() {
    const { position: { x, y } } = mouseState();
    const dampFactor = 7;
    camera.lookAt(new Vector3(-x * dampFactor, y * dampFactor, 0.5));
}

function render() {
    renderer.render(scene, camera);
}

function plantTree(raycaster: Raycaster) {
    const terrain = <Terrain>objects.find(objectByTag(Tags.Terrain));
    if (!terrain) {
        return;
    }
    const intersects = raycaster.intersectObject(terrain.mesh);
    if (intersects.length <= 0) {
        return;
    }
    const [{ point: { x, y, z }, face: { normal } }] = intersects;
    objects.push(new Tree(scene, new Vector3(x, y + 0.5, z)));
}

async function removeClickedTree(treeForRemoval: Tree) {
    await treeForRemoval.remove();
    objects = objects.filter((object) => object.uuid !== treeForRemoval.uuid);
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
        color: 0x788bff,
        side: BackSide,
    });
    return new Mesh(geometry, material);
}

function spawnTrees(terrain: Terrain, scene: Scene): GameObject[] {
    const { width, depth, snowLevel, waterLevel } = Terrain;
    const widthStart = width / 2 * -1;
    const depthStart = depth / 2 * -1;
    let trees = [];
    const spawnChance = 0.5;
    const step = 20;
    for (let z = depthStart; z < Math.abs(widthStart); z += step) {
        for (let x = widthStart; x < Math.abs(depthStart); x += step) {
            const y = terrain.positionHeight(x, z);
            if (
                y > waterLevel &&
                y < snowLevel &&
                Math.random() <= spawnChance
            ) {
                const positionRandomFactor = Math.random() / 2 * -1 * 2;
                const newTree = new Tree(
                    scene,
                    new Vector3(
                        x + positionRandomFactor,
                        y,
                        z + positionRandomFactor,
                    ),
                );
                trees.push(newTree);
            }
        }
    }
    return trees;
}
