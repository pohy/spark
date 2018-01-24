(function() {
    'use strict';

    let mouse = null;

    const LISTENER_TYPES = {
        move: 'mousemove',
        up: 'mouseup',
        down: 'mousedown',
        click: 'click',
    };

    window.Mouse = class Mouse {
        constructor() {
            this._onMouse = this._onMouse.bind(this);
            this._onMove = this._onMove.bind(this);
            this._onClick = this._onClick.bind(this);
            this.unregister = this.unregister.bind(this);
            this.listeners = [];
            this.id = 0;

            Object.values(LISTENER_TYPES).forEach((event) =>
                window.addEventListener(event, this._onMouse, false),
            );
        }

        static getInstance() {
            if (!mouse) {
                mouse = new Mouse();
            }
            return mouse;
        }

        _onMouse(event) {
            const { type } = event;
            if (type === LISTENER_TYPES.move) {
                this._onMove(event);
            } else {
                this._onClick(event);
            }
        }

        _onClick(event) {
            // TODO REally prevent default? :D:D
            event.preventDefault();

            const { type: eventType, target, button } = event;

            this.listeners.filter(typeFilter(eventType)).forEach(call);

            function call({ callback, element }) {
                if (element && element.isSameNode(target)) {
                    callback(button);
                } else if (!element) {
                    callback(button);
                }
            }
        }

        _onMove(event) {
            event.preventDefault();

            const { clientX: x, clientY: y, type: eventType, target } = event;

            this.listeners.filter(typeFilter(eventType)).forEach(call);

            function call({ callback, element }) {
                if (element && element.isSameNode(target)) {
                    const {
                        offsetLeft,
                        offsetTop,
                        offsetWidth,
                        offsetHeight,
                    } = element;
                    const relativeX = Math.min(x - offsetLeft, offsetWidth);
                    const relativeY = Math.min(y - offsetTop, offsetHeight);
                    callback({ x: relativeX, y: relativeY });
                } else if (!element) {
                    callback({ x, y });
                }
            }
        }

        onMove(callback, element) {
            return this._addMouseListener(
                LISTENER_TYPES.move,
                callback,
                element,
            );
        }

        onClick(callback, element) {
            return this._addMouseListener(
                LISTENER_TYPES.click,
                callback,
                element,
            );
        }

        onDown(callback, element) {
            return this._addMouseListener(
                LISTENER_TYPES.down,
                callback,
                element,
            );
        }

        onUp(callback, element) {
            return this._addMouseListener(LISTENER_TYPES.up, callback, element);
        }

        _addMouseListener(type, callback, element = null) {
            if (typeof callback !== 'function') {
                throw new Error('Callback is not a function');
            }
            if (element !== null && !(element instanceof Element)) {
                throw new Error('A DOM Element must be passed');
            }
            this.listeners.push(
                new MouseListener(type, callback, this.id, element),
            );
            return this.id++;
        }

        unregister(listenerID) {
            this.listeners = this.listeners.filter(
                ({ id }) => id !== listenerID,
            );
        }
    };

    class MouseListener {
        constructor(type, callback, id, element) {
            this.type = type;
            this.callback = callback;
            this.element = element;
            this.id = id;
        }
    }

    function typeFilter(eventType) {
        return ({ type: listenerType }) => listenerType === eventType;
    }
})();
