import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { getSkyBox } from "./sky";
import { tilt, resetTilt } from "./tilt";
import { setupGround, setupLight } from "./sceneDetailsSetup";
import { createParticleEffect } from "./particleSystem";
import { createTorusesInSpiral } from "./rings";
import { initMusic, stopBackgroundMusic, playCollectAudio, playSwooshAudio } from "./music";

let camera, scene, renderer, player, controls;
let keys = {};
let velocity = new THREE.Vector3();
let playerSpeed = 0.25;
let boostedSpeed = 0.5;
let slowedSpeed = 0.15;

let lastMouseMoveTime;

let score = 0;

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
    createTorusesInSpiral(scene);

    startCountdown();
    initMusic();
}

function setupScene() {
    // Setup the primary scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xa0a0ff, 0.00025 ); // Blue-ish fog
    scene.background = new THREE.Color( 0xa0a0ff ); // Blue background
    scene.add(getSkyBox());

    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.rotation.y = THREE.MathUtils.degToRad(180);

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function setupPlayer() {
    const loader = new FBXLoader();
    loader.load('broomstick.fbx', (fbx) => {
        player = fbx;
        player.scale.set(0.003, 0.003, 0.003); // Scale the model down, adjust as necessary
        player.position.set(0, -0.7, -2);
        player.rotation.z = Math.PI;  // Rotate 180 degrees
        player.rotation.x = Math.PI / 2;
        controls.getObject().add(player);
    });

    const amountOfCastlesEachSide = 10;
    loader.load('castle.fbx', (fbx) => {
        fbx.scale.set(0.03, 0.03, 0.03); // Scale the model down, adjust as necessary
        
        for (let i = 0; i < amountOfCastlesEachSide; i++) {
            const newFbx = fbx.clone();
            newFbx.position.set(Math.random() * 500 - 250, -5, Math.random() * 500 - 250);
            newFbx.rotation.y = Math.PI / Math.abs(i);  
            scene.add(newFbx)
        }
    });
}

function setupControls() {
    controls = new PointerLockControls(camera, document.body);
    controls.getObject().position.y = 1;
    controls.getObject().position.x = 100;
    controls.getObject().position.z = -50;
    scene.add(controls.getObject());
    document.addEventListener("click", function startGame() {
        if (!document.pointerLockElement) {
            startCountdown();
        }
    
        // Remove the event listener so it doesn't interfere with game controls
        document.removeEventListener("click", startGame);
    });

    document.addEventListener('mousemove', (event) => {
        if(controls.isLocked) {
            let deltaX = event.movementX;
            if (deltaX > 10) {
                playSwooshAudio();
            }
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
    document.getElementById('score').textContent = 'Rings: ' + score + "/105";
}

function updateMovement() {
    if (controls.isLocked) {

        velocity = new THREE.Vector3();
        const moveForward = keys["w"] || keys["ArrowUp"];
        const slowDown = keys["s"] || keys["ArrowDown"];

        const currentSpeed = moveForward ? boostedSpeed : (slowDown ? slowedSpeed : playerSpeed);

        velocity.z -= currentSpeed;

        controls.getObject().translateX(velocity.x);
        controls.getObject().translateY(velocity.y);
        controls.getObject().translateZ(velocity.z);

        // Get the player's current position and velocity
        const playerVelocity = velocity.clone();
        const playerPosition = controls.getObject().position;

        // Iterate through all the toruses in the scene
        scene.children.forEach((object) => {
            handleTorusCollisionDetection(playerPosition, playerVelocity, object)
        });
    }
}

function handleTorusCollisionDetection(playerPosition, playerVelocity, object) {
    if (object instanceof THREE.Mesh && object.geometry instanceof THREE.TorusGeometry) {
        
        // Calculate the distance between the player and the torus
        const distance = playerPosition.distanceTo(object.position);

        // Define a threshold distance for passing through the torus
        const passThroughThreshold = object.geometry.boundingSphere.radius;

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

            // Create a particle system at the torus position
            const torusRotation = object.quaternion; // Assuming the torus has a quaternion rotation
            createParticleEffect(scene, object.position, object.geometry, object.material, torusRotation);
            playCollectAudio();
        }
    }
}

// And modify startCountdown() to show a "Click to start" message:
function startCountdown() {
    let countdownElement = document.getElementById('countdown');
    countdownElement.style.display = 'block'; // Show the countdown
    countdownElement.innerText = "Click to Start";

    document.addEventListener("click", function countdown() {
        let count = 3;
        countdownElement.innerText = count;

        let intervalId = setInterval(function() {
            count--;
            if (count > 0) {
                countdownElement.innerText = count;
            } else {
                countdownElement.style.display = 'none'; // Hide the countdown
                clearInterval(intervalId); // Stop the countdown
                controls.lock();
                
                // Call the startTimer function to start the timer
                startTimer();
                stopBackgroundMusic();
            }
        }, 1000);

        // Remove the event listener so it doesn't interfere with game controls
        document.removeEventListener("click", countdown);
    });
}

function startTimer() {
    let seconds = 90; // Set the initial time in seconds
    let intervalId = null; // Store the interval ID

    function updateTimer() {
        seconds--;
        if (seconds <= 0) {
            // Timer reached zero
            clearInterval(intervalId);
            let text = "Not bad."
            if (score >= 50 && score < 80) {
                text = "Great!"
            } else if (score < 105) {
                text = "Terrific!"
            } else {
                text = "World Record!"
            }
            
            document.getElementById('time').textContent = "Final Score: " + score + ". " + text;

            // Perform your desired action here
            // For example, show a message, trigger an event, etc.
        } else {
            document.getElementById('time').textContent = 'Time: ' + seconds + "s";
        }
    }

    // Start the timer
    updateTimer();
    intervalId = setInterval(updateTimer, 1000);
}

