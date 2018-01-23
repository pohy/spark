(function () {
    'use strict';

    let keyboard = null;

    class Keyboard {
        constructor() {
            this.onKey = this.onKey.bind(this);

            window.addEventListener('keydown', this.onKey, false);
            window.addEventListener('keypress', this.onKey, false);
            window.addEventListener('keyup', this.onKey, false);

            this.listeners = [];
            this.id = 0;
        }

        static getInstance() {
            if (!keyboard) {
                keyboard = new Keyboard();
            }
            return keyboard;
        }

        onKey({type, code}) {
            this.listeners
                .filter(keyAndType)
                .forEach(call);

            function call({callback}) {
                callback();
            }

            function keyAndType({type: listenerType, keys: listenerKeys}) {
                return listenerType === type && listenerKeys.includes(code);
            }
        }

        onPress(keys, callback, preventDefault) {
            return this._addKeyListener(keys, 'keypress', callback);
        }
        onDown(keys, callback) {
            return this._addKeyListener(keys, 'keydown', callback);
        }
        onUp(keys, callback) {
            return this._addKeyListener(keys, 'keyup', callback);
        }
        _addKeyListener(keys, type, callback) {
            if (!Array.isArray(keys)) {
                keys = [keys];
            }
            this.listeners.push(new KeyboardListener(type, keys, this.id, callback));
            return this.id++;
        }
    }

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

    window.Keyboard = Keyboard;
})();
