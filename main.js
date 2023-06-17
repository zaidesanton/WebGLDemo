import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { getSkyBox } from "./sky";
import { tilt, resetTilt } from "./tilt";
import { setupGround, setupLight } from "./sceneDetailsSetup";

let camera, scene, renderer, player, controls;
let keys = {};
let velocity = new THREE.Vector3();
let moveSpeed = 0.3;
let lastMouseMoveTime;

let score = 0;

const spiralLevels = 3;  // number of spiral levels
const torusesPerLevel = 50;  // number of toruses per level
const spiralRadius = 50;  // radius of the spiral
const spiralHeight = 30;  // height of the spiral

init();
animate();

function init() {
    // Set up scene, camera, and renderer
    setupScene();
    setupPlayer(); // Call this before setupControls
    setupGround(scene);
    setupLight(scene);
    setupControls(); // Now setupPlayer has been called, and the broomstick exists
    initEventListeners();

    // Create random objects and spotlights
    createTorusesInSpiral();
}

function setupScene() {
    // Setup the primary scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xa0a0ff, 0.00025 ); // Blue-ish fog
    scene.background = new THREE.Color( 0xa0a0ff ); // Blue background
    scene.add(getSkyBox());

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.rotation.x = THREE.MathUtils.degToRad(-30);

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function setupPlayer() {
    const loader = new FBXLoader();
    loader.load('public/broomstick.fbx', (fbx) => {
        player = fbx;
        player.scale.set(0.003, 0.003, 0.003); // Scale the model down, adjust as necessary
        player.position.set(0, -1, -2);
        player.rotation.z = Math.PI;  // Rotate 180 degrees
        player.rotation.x = Math.PI / 2;
        controls.getObject().add(player);
    });
}

function setupControls() {
    controls = new PointerLockControls(camera, document.body);
    controls.getObject().position.y = 30;
    controls.getObject().position.x = 15;
    controls.getObject().position.z = 15;
    scene.add(controls.getObject());
    document.addEventListener("click", () => {
        if (!document.pointerLockElement) {
            controls.lock();
        }
    });

    document.addEventListener('mousemove', (event) => {
        if(controls.isLocked) {
            let deltaX = event.movementX;
            tilt(deltaX, player);
            lastMouseMoveTime = Date.now();
        }
    });
}

function initEventListeners() {
    document.addEventListener("keydown", (event) => (keys[event.key] = true));
    document.addEventListener("keyup", (event) => (keys[event.key] = false));
}

function animate() {
    requestAnimationFrame(animate);
    updateMovement();
    resetTilt(player, lastMouseMoveTime);
    renderer.clear(); // Clear the renderer
    renderer.clearDepth(); // Clear the depth buffer so the primary scene is rendered on top
    renderer.render(scene, camera); // Render the primary scene
}

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

        // Get the player's current position and velocity
        const playerPosition = controls.getObject().position;
        const playerVelocity = velocity.clone();

        // Iterate through all the toruses in the scene
        scene.children.forEach((object) => {
            if (object instanceof THREE.Mesh && object.geometry instanceof THREE.TorusGeometry) {
                // Calculate the distance between the player and the torus
                const distance = playerPosition.distanceTo(object.position);

                // Define a threshold distance for passing through the torus
                const passThroughThreshold = 5;

                // Get the vector from the torus center to the player's position
                const centerToPlayer = playerPosition.clone().sub(object.position);

                // Calculate the dot product between the player's velocity and the center-to-player vector
                const dotProduct = playerVelocity.dot(centerToPlayer);

                // If the player is close enough to the torus and the dot product is negative, consider it passed through
                if (distance < passThroughThreshold && dotProduct < 0) {
                    // Increase the score
                    incrementScore();

                    // Remove the torus from the scene
                    scene.remove(object);
                }
            }
        });

    }
}

function createRandomMaterial() {
    return new THREE.MeshStandardMaterial({
        color: Math.floor(Math.random() * 16777215),
        metalness: Math.random(),
        roughness: Math.random(),
    });
}

function createTorusesInSpiral() {
    const totalToruses = torusesPerLevel * spiralLevels;
    const totalHeight = 100;
    for (let i = 0; i < totalToruses; i++) {
        const angle = 2 * Math.PI * i / torusesPerLevel;
        const x = spiralRadius * Math.cos(angle);
        const z = spiralRadius * Math.sin(angle);
        const y = (i / totalToruses) * totalHeight; // This will create a continuous upward spiral path

        const position = new THREE.Vector3(x, y, z);

        // Compute the position for the next torus, which is used for the lookAt position
        const nextAngle = 2 * Math.PI * (i + 1) / torusesPerLevel;
        const nextX = spiralRadius * Math.cos(nextAngle);
        const nextZ = spiralRadius * Math.sin(nextAngle);
        const nextY = ((i + 1) / totalToruses) * totalHeight; 

        const lookAtPosition = new THREE.Vector3(nextX, nextY, nextZ);

        createTorus(position, lookAtPosition);
    }
}

function createTorus(position, lookAtPosition) {
    const geometry = new THREE.TorusGeometry(5, 0.5, 16, 100);
    const material = createRandomMaterial();  // Assuming this function is still defined in your code

    const torus = new THREE.Mesh(geometry, material);
    torus.position.copy(position);
    torus.lookAt(lookAtPosition);

    scene.add(torus);
}

