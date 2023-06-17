import * as THREE from "three";

const spiralLevels = 3;  // number of spiral levels
const torusesPerLevel = 35;  // number of toruses per level
const spiralRadius = 100;  // radius of the spiral
const totalToruses = torusesPerLevel * spiralLevels;
const totalHeight = 300;

const colors = [new THREE.Color("#0000FF"), new THREE.Color("#00FF00"), new THREE.Color("#FFFF00"), new THREE.Color("#FF0000")]
const difficultyLevels = 4;
const torusesPerColor = totalToruses / (difficultyLevels - 1);
const torusesPerDifficulty = totalToruses / difficultyLevels;
const maxRadius = 3;
const minRadius = 0.5;
const radiusDecrease = (maxRadius - minRadius) / (difficultyLevels - 1);

const movementDistance = 0.01; // Adjust the movement distance as desired
const movementSpeed = 0.003; // Adjust the movement speed as desired
const torusMovements = [];
const torusGroup = new THREE.Group(); // Create a group to hold all the toruses

export function createTorusesInSpiral(scene) {
    
    for (let i = 0; i < totalToruses; i++) {
        const angle = 2 * Math.PI * i / torusesPerLevel;
        const x = spiralRadius * Math.cos(angle);
        const z = spiralRadius * Math.sin(angle);
        const y = (i / totalToruses) * totalHeight;

        const position = new THREE.Vector3(x, y, z);
        const nextAngle = 2 * Math.PI * (i + 1) / torusesPerLevel;
        const nextX = spiralRadius * Math.cos(nextAngle);
        const nextZ = spiralRadius * Math.sin(nextAngle);
        const nextY = ((i + 1) / totalToruses) * totalHeight;
        const lookAtPosition = new THREE.Vector3(nextX, nextY, nextZ);

        const color = new THREE.Color();
        const firstColorIndex = Math.floor(i / torusesPerColor);
        const secondColorIndex = firstColorIndex + 1;

        color.lerpColors(colors[firstColorIndex], colors[secondColorIndex], (i % torusesPerColor) / torusesPerColor);

        const currentTorus = createTorus(i, position, lookAtPosition, color);
        const currentMovement = new THREE.Vector3(
            (Math.random() * 2 - 1) * movementDistance,
            (Math.random() * 2 - 1) * movementDistance,
            (Math.random() * 2 - 1) * movementDistance
        )

        torusMovements.push(currentMovement)
        torusGroup.add(currentTorus);
        scene.add(currentTorus);
    }
    
    // Animate the movement of the torus group
    function animateToruses() {
        const time = Date.now() * movementSpeed;

        scene.children.filter(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry).forEach((object, index) => {
            const currentMovement = torusMovements[index];

            object.position.x += Math.sin(time) * currentMovement.x;
            object.position.z += Math.sin(time) * currentMovement.z;
            object.position.y += Math.sin(time) * currentMovement.y;
        });

        requestAnimationFrame(animateToruses);
    }

    animateToruses();
}


function createTorus(index, position, lookAtPosition, color) {
    const radius = maxRadius - (Math.floor(index / torusesPerDifficulty) * radiusDecrease);
    const geometry = new THREE.TorusGeometry(radius, radius / 10, 16, 100);
    const material = new THREE.MeshPhongMaterial({ color: color });

    const torus = new THREE.Mesh(geometry, material);
    torus.position.copy(position);
    torus.lookAt(lookAtPosition);

    return torus;
}
