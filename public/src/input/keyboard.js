(function() {
    'use strict';

    let keyboard = null;

    const LISTENER_TYPES = {
        down: 'keydown',
        up: 'keyup',
        press: 'keypress',
    };

    window.Keyboard = class Keyboard {
        constructor() {
            this._onKey = this._onKey.bind(this);

            Object.values(LISTENER_TYPES).forEach((event) =>
                window.addEventListener(event, this._onKey, false),
            );

            this.listeners = [];
            this.id = 0;
        }

        static getInstance() {
            if (!keyboard) {
                keyboard = new Keyboard();
            }
            return keyboard;
        }

        _onKey(event) {
            event.preventDefault();

            const { type, code } = event;
            this.listeners.filter(keyAndType).forEach(call);

            function call({ callback }) {
                callback();
            }

            function keyAndType({ type: listenerType, keys: listenerKeys }) {
                return listenerType === type && listenerKeys.includes(code);
            }
        }

        onPress(keys, callback) {
            return this._addKeyListener(keys, LISTENER_TYPES.press, callback);
        }
        onDown(keys, callback) {
            return this._addKeyListener(keys, LISTENER_TYPES.down, callback);
        }
        onUp(keys, callback) {
            return this._addKeyListener(keys, LISTENER_TYPES.up, callback);
        }
        _addKeyListener(keys, type, callback) {
            if (!Array.isArray(keys)) {
                keys = [keys];
            }
            this.listeners.push(
                new KeyboardListener(type, keys, this.id, callback),
            );
            return this.id++;
        }
    };

    class KeyboardListener {
        /**
         * @param {string} type
         * @param {array} keys
         * @param {number} id
         * @param {function} callback
         */
        constructor(type, keys, id, callback) {
            this.type = type;
            this.keys = keys;
            this.id = id;
            this.callback = callback;
        }
    }
})();
