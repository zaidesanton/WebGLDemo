import * as THREE from "three";

export function createParticleEffect(scene, position, geometry, material, rotation) {
    const particleCount = geometry.getAttribute('position').count;
    const particleSize = 0.2; // Size of each particle

    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    // Set particle positions to match torus vertices, considering torus rotation
    const torusVertices = geometry.getAttribute('position').array;
    const torusMatrix = new THREE.Matrix4().makeRotationFromQuaternion(rotation);
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const vertex = new THREE.Vector3(torusVertices[i3], torusVertices[i3 + 1], torusVertices[i3 + 2]);
        vertex.applyMatrix4(torusMatrix);
        positions[i3] = vertex.x + position.x;
        positions[i3 + 1] = vertex.y + position.y;
        positions[i3 + 2] = vertex.z + position.z;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({ 
        size: particleSize,
        color: material.color,
        map: material.map,
        alphaTest: 0.5,
        transparent: true
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Animate and remove the particle system after a certain duration
    const duration = 2; // Duration in seconds
    const startTime = Date.now();

    function animateParticles() {
        const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds

        let speedDivider = 2;

        // Update particle positions based on time elapsed
        const particlePositions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const vertex = new THREE.Vector3(
                particlePositions[i3] - position.x,
                particlePositions[i3 + 1] - position.y,
                particlePositions[i3 + 2] - position.z
            );
            vertex.addScaledVector(vertex, elapsedTime / duration * ( 1/speedDivider));
            particlePositions[i3] = vertex.x + position.x;
            particlePositions[i3 + 1] = vertex.y + position.y;
            particlePositions[i3 + 2] = vertex.z + position.z;
        }

        particles.geometry.attributes.position.needsUpdate = true;

        if (elapsedTime < duration) {
            requestAnimationFrame(animateParticles);
        } else {
            scene.remove(particles);
        }
    }

    animateParticles();
}