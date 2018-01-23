(function () {
    'use strict';

    window.keyboardState = keyboardState;

    const BINDS = {
        up: ['ArrowUp', 'KeyW'],
        down: ['ArrowDown', 'KeyS'],
        left: ['ArrowLeft', 'KeyA'],
        right: ['ArrowRight', 'KeyD'],
        sprint: ['ShiftLeft', 'ShiftRight']
    };

    const state = Object
        .keys(BINDS)
        .reduce((state, actionName) => Object.assign(
            {},
            state,
            {[actionName]: false}
        ), {});

    setupKeyboard();

    function setupKeyboard() {
        const keyboard = Keyboard.getInstance();
        Object
            .keys(BINDS)
            .forEach((action) => {
                keyboard.onDown(BINDS[action], toggleKeyboardState(action, true));
                keyboard.onUp(BINDS[action], toggleKeyboardState(action, false));
            });
        return keyboard;
    }

    function toggleKeyboardState(stateName, value) {
        return () => {
            if (typeof state[stateName] === 'undefined') {
                throw new Error(`Trying to toggle non existent state ${stateName}`);
            }
            state[stateName] = value;
        };
    }

    function keyboardState() {
        return state;
    }

})();