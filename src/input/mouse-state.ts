import { Mouse, MouseButtons } from './mouse';
import { Vector2 } from 'three';

export interface MouseState {
    position: Vector2;
    positionDelta: Vector2;
    left: boolean;
    right: boolean;
    middle: boolean;
}

const mouse = Mouse.getInstance();
const listenerIDs: number[] = [];

const state: MouseState = {
    position: new Vector2(),
    positionDelta: new Vector2(0, 0),
    left: false,
    right: false,
    middle: false,
};

export function mouseState() {
    return state;
}

export function mouseStateSetRelativeElement(element?: HTMLElement) {
    listenerIDs.forEach(mouse.unregister);
    registerMouse(element);
}

registerMouse();

function registerMouse(element?: HTMLElement) {
    listenerIDs.push(mouse.onMove(onMove(element), element));
    listenerIDs.push(mouse.onUp(onButton(false), element));
    listenerIDs.push(mouse.onDown(onButton(true), element));
    // TODO toggle on click for a single frame; probably a hybrid between Up and Down events
}

function onButton(value: boolean) {
    return (button: MouseButtons) => {
        switch (button) {
            case MouseButtons.Left:
                state.left = value;
                break;
            case MouseButtons.Middle:
                state.middle = value;
                break;
            case MouseButtons.Right:
                state.right = value;
                break;
        }
    };
}

function onMove(element?: HTMLElement) {
    return ({ x, y }: Vector2) => {
        const { x: oldX, y: oldY } = state.position;
        const width = element ? element.clientWidth : window.innerWidth;
        const height = element ? element.clientHeight : window.innerHeight;
        const newX = x / width * 2 - 1;
        const newY = -(y / height) * 2 + 1;
        state.positionDelta.copy(new Vector2(newX - oldX, newY - oldY));
        state.position.copy(new Vector2(newX, newY));
    };
}
