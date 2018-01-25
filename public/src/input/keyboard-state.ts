import { Keyboard } from './keyboard';

class Bind {
    constructor(public action: string, public keys: string[]) {}
}

const binds = [
    new Bind('up', ['ArrowUp', 'KeyW']),
    new Bind('down', ['ArrowDown', 'KeyS']),
    new Bind('left', ['ArrowLeft', 'KeyA']),
    new Bind('right', ['ArrowRight', 'KeyD']),
    new Bind('sprint', ['ShiftLeft', 'ShiftRight']),
];

export interface KeyboardState {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    sprint: boolean;
    [key: string]: boolean;
}

const state: KeyboardState = {
    up: false,
    down: false,
    left: false,
    right: false,
    sprint: false,
};

export function keyboardState() {
    return state;
}

const keyboard = Keyboard.getInstance();
binds.forEach(({ action, keys }) => {
    keyboard.onDown(keys, toggleKeyboardState(action, true));
    keyboard.onUp(keys, toggleKeyboardState(action, false));
});

function toggleKeyboardState(stateName: string, value: boolean) {
    return () => {
        if (typeof state[stateName] === 'undefined') {
            throw new Error(`Trying to toggle non existent state ${stateName}`);
        }
        state[stateName] = value;
    };
}
