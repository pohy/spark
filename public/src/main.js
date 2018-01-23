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

        mouseStateSetElement(renderer.domElement);

        const raycaster = new THREE.Raycaster();

        const ground = createPlane();
        ground.position.y = -0.5;
        ground.rotation.x = degToRad(90);
        ground.receiveShadow = true;

        const ambientLight = new THREE.AmbientLight(0x444444);

        const player = new Player(scene);

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
            const { position, position: { x, y }, left } = mouseState();
            raycaster.setFromCamera(position, camera);
            if (left && !wasClicked) {
                const intersects = raycaster.intersectObject(ground);
                wasClicked = true;
                if (intersects.length) {
                    scene.add(generateCube(intersects[0].point));
                }
            } else if (!left && wasClicked) {
                wasClicked = false;
            }
            const dampFactor = 7;
            camera.lookAt(
                new THREE.Vector3(x * dampFactor, y * dampFactor, 0.5),
            );
            player.update(delta);
        }

        function render() {
            renderer.render(scene, camera);
        }

        function generateCube({ x, y, z }) {
            const cube = createCube();
            cube.position.set(x, y + 0.5, z);
            return cube;
        }
    }

    function createCube() {
        const geometry = new THREE.CubeGeometry(1, 1, 1);
        const color = new THREE.Color(Math.random(), 1, Math.random());
        const material = new THREE.MeshPhongMaterial({
            color: color.getHex(),
        });
        const cubeMesh = new THREE.Mesh(geometry, material);
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        return cubeMesh;
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
