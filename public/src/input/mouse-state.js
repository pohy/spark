(function() {
    'use strict';

    window.mouseState = mouseState;
    window.mouseStateSetElement = setElement;

    const mouse = Mouse.getInstance();
    const listenerIDs = [];

    const state = {
        position: new THREE.Vector2(),
        left: false,
        right: false,
        middle: false,
    };

    registerMouse();

    function setElement(element) {
        listenerIDs.forEach(mouse.unregister);
        registerMouse(element);
    }

    function registerMouse(element = null) {
        listenerIDs.push(mouse.onMove(onMove(element), element));
        listenerIDs.push(mouse.onUp(onButton(false), element));
        listenerIDs.push(mouse.onDown(onButton(true), element));
        // TODO toggle on click for a single frame; probably a hybrid between Up and Down events
    }

    function onButton(value) {
        return (button) => {
            switch (button) {
                case 0:
                    state.left = value;
                    break;
                case 1:
                    state.middle = value;
                    break;
                case 2:
                    state.right = value;
                    break;
            }
        };
    }

    function onMove(element) {
        return ({ x, y }) => {
            if (element) {
                state.position.x = x / element.clientWidth * 2 - 1;
                state.position.y = -(y / element.clientHeight) * 2 + 1;
            } else {
                state.position.x = x / window.innerWidth * 2 - 1;
                state.position.y = -(y / window.innerHeight) * 2 + 1;
            }
        };
    }

    function mouseState() {
        return state;
    }
})();
