import * as THREE from "three";

export function setupGround(scene) {
    const loader = new THREE.TextureLoader();
    loader.load('MJGrass2.png', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 200, 200 ); // You might need to adjust these values
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = Math.PI / 2;
        ground.position.y = -5;
        scene.add(ground);
    });
}

export function setupLight(scene) {
    // Hemispheric light to simulate daylight
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    light.position.set(0, 200, 0);
    scene.add(light);

    // Add a directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 200, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}