import * as THREE from "three";

const tiltResetSpeed = 0.15; // Adjust to change speed of tilt reset
const sensitivity = 0.03; // Adjust to change tilt sensitivity
const maxTilt = 0.5; // Adjust to change maximum tilt
let tiltAmount = 0;

export function tilt(deltaX, player) {
    // Calculate tilt amount
   let tiltAmount = deltaX * sensitivity;

   // Limit tilt to maximum
   if (tiltAmount > maxTilt) {
       tiltAmount = maxTilt;
   } else if (tiltAmount < -maxTilt) {
       tiltAmount = -maxTilt;
   }

   // Apply tilt to broomstick model
   player.rotation.z = THREE.MathUtils.lerp(
       player.rotation.z,
       Math.PI + tiltAmount,
       0.05
   );
}

export function resetTilt(player, lastMouseMoveTime) {
    const timeSinceLastMouseMove = Date.now() - lastMouseMoveTime;
    if (timeSinceLastMouseMove > 100) { // Adjust time to change when tilt resets
        if (player) {
            player.rotation.z = THREE.MathUtils.lerp(
                player.rotation.z,
                Math.PI,
                tiltResetSpeed
            );
        }
    } else {
        if (player) {
            player.rotation.z = THREE.MathUtils.lerp(
                player.rotation.z,
                Math.PI + tiltAmount,
                0.05
            );
        }
    }
}