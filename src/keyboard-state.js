(function () {
    'use strict';

    window.keyboardState = keyboardState;

    const state = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    setupKeyboard();

    function setupKeyboard() {
        const keyboard = Keyboard.getInstance();
        keyboard.onDown('ArrowLeft', toggleKeyboardState('left', true));
        keyboard.onDown('ArrowRight', toggleKeyboardState('right', true));
        keyboard.onDown('ArrowUp', toggleKeyboardState('up', true));
        keyboard.onDown('ArrowDown', toggleKeyboardState('down', true));
        keyboard.onUp('ArrowLeft', toggleKeyboardState('left', false));
        keyboard.onUp('ArrowRight', toggleKeyboardState('right', false));
        keyboard.onUp('ArrowUp', toggleKeyboardState('up', false));
        keyboard.onUp('ArrowDown', toggleKeyboardState('down', false));

        keyboard.onDown('a', toggleKeyboardState('left', true));
        keyboard.onDown('d', toggleKeyboardState('right', true));
        keyboard.onDown('w', toggleKeyboardState('up', true));
        keyboard.onDown('s', toggleKeyboardState('down', true));
        keyboard.onUp('a', toggleKeyboardState('left', false));
        keyboard.onUp('d', toggleKeyboardState('right', false));
        keyboard.onUp('w', toggleKeyboardState('up', false));
        keyboard.onUp('s', toggleKeyboardState('down', false));
        return keyboard;
    }

    function toggleKeyboardState(stateName, value) {
        return () => {
            if (typeof state[stateName] === 'undefined') {
                throw new Error(`Trying to toggle non existtent state ${stateName}`);
            }
            // console.log(`Changing state '${stateName} to: ${value}`)
            state[stateName] = value;
        };
    }

    function keyboardState() {
        return state;
    }

})();