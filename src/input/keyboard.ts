let keyboardInstance: Keyboard;

export enum KeyboardListenerTypes {
    Down = 'keydown',
    Up = 'keyup',
    Press = 'keypress',
}

export interface KeyCallback {
    (): void;
}

export class Keyboard {
    private listeners: KeyboardListener[] = [];
    private id: number = 0;

    constructor() {
        this.onKey = this.onKey.bind(this);

        window.addEventListener(KeyboardListenerTypes.Down, this.onKey, false);
        window.addEventListener(KeyboardListenerTypes.Up, this.onKey, false);
        window.addEventListener(KeyboardListenerTypes.Press, this.onKey, false);
    }

    public static getInstance() {
        if (!keyboardInstance) {
            keyboardInstance = new Keyboard();
        }
        return keyboardInstance;
    }

    private onKey(event: KeyboardEvent) {
        event.preventDefault();

        const { type, code } = event;
        this.listeners.filter(keyAndType).forEach(call);

        function call({ callback }: KeyboardListener) {
            callback();
        }

        function keyAndType({
            type: listenerType,
            keys: listenerKeys,
        }: KeyboardListener): boolean {
            return listenerType === type && listenerKeys.includes(code);
        }
    }

    onPress(keys: string[], callback: KeyCallback) {
        return this._addKeyListener(
            keys,
            KeyboardListenerTypes.Press,
            callback,
        );
    }
    onDown(keys: string[], callback: KeyCallback) {
        return this._addKeyListener(keys, KeyboardListenerTypes.Down, callback);
    }
    onUp(keys: string[], callback: KeyCallback) {
        return this._addKeyListener(keys, KeyboardListenerTypes.Up, callback);
    }
    _addKeyListener(
        keys: string[],
        type: KeyboardListenerTypes,
        callback: KeyCallback,
    ) {
        this.listeners.push(
            new KeyboardListener(type, keys, this.id, callback),
        );
        return this.id++;
    }
}

class KeyboardListener {
    constructor(
        public type: KeyboardListenerTypes,
        public keys: string[],
        public id: number,
        public callback: KeyCallback,
    ) {}
}
