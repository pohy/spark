(function() {
    'use strict';

    window.addEventListener('load', main);

    function main() {
        const gameEl = document.getElementById('game');
        const width = 1280,
            height = 720;

        const stats = new Stats();
        document.body.appendChild(stats.dom);

        const clock = new THREE.Clock();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000,
        );
        const axisHelper = new THREE.AxesHelper(50);

        const renderer = new THREE.WebGLRenderer({
            canvas: gameEl,
        });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);
        renderer.domElement.focus();
        renderer.domElement.addEventListener('contextmenu', (event) =>
            event.preventDefault(),
        );

        mouseStateSetElement(renderer.domElement);

        const raycaster = new THREE.Raycaster();

        const ground = createPlane();
        ground.rotateX(degToRad(90));
        ground.receiveShadow = true;

        const ambientLight = new THREE.AmbientLight(0x444444);

        let objects = [new Player(scene)];

        scene.add(ambientLight);

        scene.add(ground);
        scene.add(createSkyBox());
        scene.add(axisHelper);

        camera.position.x = -5;
        camera.position.y = 5;
        camera.position.z = 5;
        camera.rotateX(degToRad(-45));
        camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), degToRad(-45));

        let wasClicked = false;

        animate();

        function animate() {
            const delta = clock.getDelta();

            update(delta);
            render();

            stats.update();
            window.requestAnimationFrame(animate);
        }

        function update(delta) {
            const {
                position,
                position: { x: mouseX, y: mouseY },
                left,
                right,
            } = mouseState();
            raycaster.setFromCamera(position, camera);
            if (left && !wasClicked) {
                wasClicked = true;
                spawnNewTree(raycaster);
            } else if (right && !wasClicked) {
                wasClicked = true;
                removeIntersectedTrees(raycaster);
            } else if (!left && !right && wasClicked) {
                wasClicked = false;
            }
            const dampFactor = 7;
            camera.lookAt(
                new THREE.Vector3(
                    mouseX * dampFactor,
                    mouseY * dampFactor,
                    0.5,
                ),
            );
            objects.forEach((object) => object.update(delta));
        }

        function render() {
            renderer.render(scene, camera);
        }

        function spawnNewTree(raycaster) {
            const intersects = raycaster.intersectObject(ground);
            if (intersects.length) {
                const { x, y, z } = intersects[0].point;
                objects.push(new Tree(scene, { x, y: y + 0.5, z }));
            }
        }

        function removeIntersectedTrees(raycaster) {
            const intersects = raycaster.intersectObjects(scene.children);
            if (intersects.length <= 0) {
                return;
            }
            const intersectedUUIDs = intersects.map(
                ({ object: { uuid } }) => uuid,
            );
            const treeForRemoval = objects.find(
                objectByUUIDs(intersectedUUIDs),
            );
            if (!treeForRemoval) {
                return;
            }
            treeForRemoval.remove();
            objects = objects.filter(
                ({ uuid }) => uuid !== treeForRemoval.uuid,
            );
        }
    }

    function objectByUUIDs(uuids) {
        return ({ uuid }) => uuids.includes(uuid);
    }

    function createSkyBox() {
        const geometry = new THREE.CubeGeometry(900, 900, 900);
        const material = new THREE.MeshBasicMaterial({
            color: 0x9999ff,
            side: THREE.BackSide,
        });
        return new THREE.Mesh(geometry, material);
    }

    function createLine(start, end) {
        const geometry = new THREE.Geometry();
        geometry.vertices.push(start);
        geometry.vertices.push(end);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
        });
        return new THREE.Line(geometry, material);
    }

    function createPlane() {
        const geometry = new THREE.PlaneGeometry(50, 50);
        const material = new THREE.MeshPhongMaterial({
            color: 0xa9a9a9,
            side: THREE.DoubleSide,
        });
        return new THREE.Mesh(geometry, material);
    }
})();
