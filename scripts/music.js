import * as THREE from 'three';

// Create an AudioListener
const listener = new THREE.AudioListener();

// Create an AudioLoader
const audioLoader = new THREE.AudioLoader();

// Create a global audio source
const backgroundAudio = new THREE.Audio(listener);
const collectAudio = new THREE.Audio(listener);
const swooshAudio = new THREE.Audio(listener);

export function initMusic() {
    // Load an audio file
    audioLoader.load('backgroundMusic.mp3', function(buffer) {
        // Set the audio buffer to the audio source
        backgroundAudio.setBuffer(buffer);

        playBackgroundMusic();
    });

    audioLoader.load('collect.wav', function(buffer) {
        collectAudio.setBuffer(buffer);
    });

    audioLoader.load('swoosh.wav', function(buffer) {
        swooshAudio.setBuffer(buffer);
    });
}

export function playCollectAudio() {
    if (collectAudio.isPlaying)
        collectAudio.stop();
    collectAudio.play();
}

export function playSwooshAudio() {
    if (swooshAudio.isPlaying)
        swooshAudio.stop();
    swooshAudio.play();
}

// Function to play the audio
export function playBackgroundMusic() {
    backgroundAudio.play();
}

// Function to pause the audio
export function stopBackgroundMusic() {
    stopMusic(backgroundAudio, 2);
}

function stopMusic(audio, fadeDuration = 0) {
    const initialVolume = audio.getVolume(); // Get the initial volume

    // Calculate the decrement value for each frame update
    const decrement = initialVolume / (fadeDuration * 60); // Assuming 60 frames per second

    // Function to gradually decrease the volume
    function fadeOut() {
        const currentVolume = audio.getVolume();
        const newVolume = Math.max(currentVolume - decrement, 0); // Ensure the volume doesn't go below 0

        audio.setVolume(newVolume);

        if (newVolume > 0) {
            requestAnimationFrame(fadeOut);
        } else {
            audio.stop();
            audio.setVolume(initialVolume); // Reset the volume to its initial value
        }
    }

    // Start the fade-out effect
    fadeOut();
}