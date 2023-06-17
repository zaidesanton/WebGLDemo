import * as THREE from "three";

const spiralLevels = 3;  // number of spiral levels
const torusesPerLevel = 50;  // number of toruses per level
const spiralRadius = 50;  // radius of the spiral


export function createTorusesInSpiral(scene) {
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

        const currentTorus = createTorus(position, lookAtPosition);
        scene.add(currentTorus);
    }
}

function createTorus(position, lookAtPosition) {
    const geometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100);
    const material = createRandomMaterial();  // Assuming this function is still defined in your code

    const torus = new THREE.Mesh(geometry, material);
    torus.position.copy(position);
    torus.lookAt(lookAtPosition);

    return torus;
}

function createRandomMaterial() {
    return new THREE.MeshStandardMaterial({
        color: Math.floor(Math.random() * 16777215),
        metalness: Math.random(),
        roughness: Math.random(),
    });
}
