import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

let camera, scene, renderer, player, controls, broomstickScene, broomstickCamera;
let keys = {};
let velocity = new THREE.Vector3();
let moveSpeed = 0.3;

init();
animate();

function init() {
    // Set up scene, camera, and renderer
    setupScene();
    setupPlayer(); // Call this before setupControls
    setupGround();
    setupLight();
    setupControls(); // Now setupPlayer has been called, and the broomstick exists
    initEventListeners();

    // Create random objects and spotlights
    createRandomObjects(50);
    createRandomSpotLights(15);
}

function setupScene() {
    // Setup the primary scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.rotation.x = THREE.MathUtils.degToRad(-45);

    // Setup the secondary scene for the broomstick
    broomstickScene = new THREE.Scene();
    broomstickCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1);
    broomstickCamera.position.set(0, -0.3, -0.5);

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function setupPlayer() {
    const playerGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 32);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });

    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, -0.5, -0.3);
    player.rotation.x = Math.PI / 2;
}

function setupGround() {
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, side: THREE.DoubleSide });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    scene.add(ground);
}

function setupLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
}

function setupControls() {
    controls = new PointerLockControls(camera, document.body);
    controls.getObject().position.y = 30;
    controls.getObject().position.x = 15;
    controls.getObject().position.z = 15;
    // Add the broomstick to the controls object
    controls.getObject().add(player);
    scene.add(controls.getObject());
    document.addEventListener("click", () => controls.lock());
}
function initEventListeners() {
    document.addEventListener("keydown", (event) => (keys[event.key] = true));
    document.addEventListener("keyup", (event) => (keys[event.key] = false));
}

function animate() {
    requestAnimationFrame(animate);
    updateMovement();
    renderer.clear(); // Clear the renderer
    renderer.render(broomstickScene, broomstickCamera); // Render the broomstick scene first
    renderer.clearDepth(); // Clear the depth buffer so the primary scene is rendered on top
    renderer.render(scene, camera); // Render the primary scene
}

let score = 0;

function incrementScore() {
    score++;
    document.getElementById('score').textContent = 'Score: ' + score;
}

function updateMovement() {
    if (controls.isLocked) {
        velocity = new THREE.Vector3();
        const moveForward = keys["w"] || keys["ArrowUp"];
        const moveBackward = keys["s"] || keys["ArrowDown"];
        const moveLeft = keys["a"] || keys["ArrowLeft"];
        const moveRight = keys["d"] || keys["ArrowRight"];
        const moveUp = keys["r"];
        const moveDown = keys["f"];
        if (moveForward) velocity.z -= moveSpeed;
        if (moveBackward) velocity.z += moveSpeed;
        if (moveLeft) velocity.x -= moveSpeed;
        if (moveRight) velocity.x += moveSpeed;
        if (moveUp) velocity.y += moveSpeed;
        if (moveDown) velocity.y -= moveSpeed;
        controls.getObject().translateX(velocity.x);
        controls.getObject().translateY(velocity.y);
        controls.getObject().translateZ(velocity.z);
    }
}

function createRandomObjects(numOfObjects) {
    for (let i = 0; i < numOfObjects; i++) {
        createRandomObject();
    }
}

function createRandomObject() {
    const geoTypes = ["sphere", "box", "torus", "cylinder"];
    const type = geoTypes[Math.floor(Math.random() * geoTypes.length)];
    const geometry = generateRandomGeometry(type);
    const material = createRandomMaterial();

    const object = new THREE.Mesh(geometry, material);
    object.position.set(
        Math.random() * 50 - 25,
        Math.random() * 10 + 1,
        Math.random() * 50 - 25
    );

    scene.add(object);
}

function generateRandomGeometry(type) {
    switch (type) {
        case "sphere":
            return new THREE.SphereGeometry(Math.random() * 3, Math.random() * 64 + 32, Math.random() * 64 + 32);
        case "torus":
            return new THREE.TorusGeometry(Math.random() * 5, Math.random() + 0.2, 16, 100);
        case "cylinder":
            return new THREE.CylinderGeometry(Math.random() * 3, Math.random() * 3, Math.random() * 7 + 1, 16);
        default:
            return new THREE.BoxGeometry(Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }
}

function createRandomMaterial() {
    return new THREE.MeshStandardMaterial({
        color: Math.floor(Math.random() * 16777215),
        metalness: Math.random(),
        roughness: Math.random(),
    });
}

function createRandomSpotLights(numOfLights) {
    for (let i = 0; i < numOfLights; i++) {
        createRandomSpotLight();
    }
}

function createRandomSpotLight() {
    const spotLight = new THREE.SpotLight(
        Math.floor(Math.random() * 16777215),
        Math.random() * 4,
        Math.random() * 100 + 50,
        Math.PI / 6,
        0.5,
        2
    );

    spotLight.position.set(
        Math.random() * 100 - 50,
        Math.random() * 30 + 10,
        Math.random() * 100 - 50
    );

    scene.add(spotLight);
}