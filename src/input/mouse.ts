import { Vector2 } from 'three';

let mouseInstance: Mouse;

export enum MouseListenerTypes {
    Move = 'mousemove',
    Up = 'mouseup',
    Down = 'mousedown',
    Click = 'click',
}

export enum MouseButtons {
    Left = 0,
    Middle = 1,
    Right = 2,
}

export interface MoveCallback {
    (position: Vector2): void;
}

export interface ButtonCallback {
    (button: number): void;
}

export class Mouse {
    private listeners: MouseListener[] = [];
    private id: number = 0;

    constructor() {
        window.addEventListener(
            MouseListenerTypes.Move,
            this.moveListener,
            false,
        );
        window.addEventListener(
            MouseListenerTypes.Up,
            this.buttonListener,
            false,
        );
        window.addEventListener(
            MouseListenerTypes.Down,
            this.buttonListener,
            false,
        );
        window.addEventListener(
            MouseListenerTypes.Click,
            this.buttonListener,
            false,
        );
    }

    public static getInstance() {
        if (!mouseInstance) {
            mouseInstance = new Mouse();
        }
        return mouseInstance;
    }

    public onMove(moveCallback: MoveCallback, element?: HTMLElement) {
        return this.addMouseEventListener(
            MouseListenerTypes.Move,
            { moveCallback },
            element,
        );
    }

    public onClick(buttonCallback: ButtonCallback, element?: HTMLElement) {
        return this.addMouseEventListener(
            MouseListenerTypes.Click,
            { buttonCallback },
            element,
        );
    }

    public onDown(buttonCallback: ButtonCallback, element?: HTMLElement) {
        return this.addMouseEventListener(
            MouseListenerTypes.Down,
            { buttonCallback },
            element,
        );
    }

    public onUp(buttonCallback: ButtonCallback, element?: HTMLElement) {
        return this.addMouseEventListener(
            MouseListenerTypes.Up,
            { buttonCallback },
            element,
        );
    }

    public unregister = (listenerID: number) => {
        this.listeners = this.listeners.filter(({ id }) => id !== listenerID);
    };

    private buttonListener = (event: MouseEvent) => {
        // TODO REally prevent default? :D:D
        event.preventDefault();

        const { type: eventType, button, target } = event;

        this.listeners
            .filter(this.typeFilter(eventType))
            .forEach(({ callback: { buttonCallback }, element }) => {
                if (!element || Mouse.isSameElement(target, element)) {
                    buttonCallback && buttonCallback(button);
                }
            });
    };

    private moveListener = (event: MouseEvent) => {
        event.preventDefault();

        const { clientX: x, clientY: y, type: eventType, target } = event;

        this.listeners
            .filter(this.typeFilter(eventType))
            .forEach(({ callback: { moveCallback }, element }) => {
                const position = new Vector2(x, y);
                if (element && Mouse.isSameElement(target, element)) {
                    const {
                        offsetLeft,
                        offsetTop,
                        offsetWidth,
                        offsetHeight,
                    } = element;
                    position.x = Math.min(x - offsetLeft, offsetWidth);
                    position.y = Math.min(y - offsetTop, offsetHeight);
                } else if (element) {
                    return;
                }
                moveCallback && moveCallback(position);
            });
    };

    private addMouseEventListener(
        type: MouseListenerTypes,
        callback: MouseListenerCallback,
        element?: HTMLElement,
    ) {
        this.listeners.push(
            new MouseListener(type, callback, this.id, element),
        );
        return this.id++;
    }

    private typeFilter(eventType: string) {
        return ({ type: listenerType }: MouseListener) =>
            listenerType === eventType;
    }

    private static isSameElement(
        eventTarget: EventTarget,
        element: HTMLElement,
    ): boolean {
        const target = <HTMLElement>eventTarget;
        return element.isSameNode(target);
    }
}

interface MouseListenerCallback {
    moveCallback?: MoveCallback;
    buttonCallback?: ButtonCallback;
}

class MouseListener {
    public type: MouseListenerTypes;
    public callback: MouseListenerCallback;
    public id: number;
    public element?: HTMLElement;

    constructor(
        type: MouseListenerTypes,
        callback: MouseListenerCallback,
        id: number,
        element?: HTMLElement,
    ) {
        if (!callback.moveCallback && !callback.buttonCallback) {
            throw new Error('Move or button callback is required');
        }
        this.type = type;
        this.id = id;
        this.element = element;
        this.callback = callback;
    }
}
