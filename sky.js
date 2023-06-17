import { ShaderMaterial, Color } from 'three';
import * as THREE from "three";

// Define the gradient shader
const gradientShader = {
    uniforms: {
        topColor: { value: new Color(0x0077ff) }, // Sky blue
        bottomColor: { value: new Color(0xffffff) }, // White
        offset: { value: 0 },
        exponent: { value: 0.6 }
    },
    vertexShader: [
        "varying vec3 vWorldPosition;",
        "void main() {",
        "   vec4 worldPosition = modelMatrix * vec4(position, 1.0);",
        "   vWorldPosition = worldPosition.xyz;",
        "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
    ].join("\n"),
    fragmentShader: [
        "uniform vec3 topColor;",
        "uniform vec3 bottomColor;",
        "uniform float offset;",
        "uniform float exponent;",
        "varying vec3 vWorldPosition;",
        "void main() {",
        "   float h = normalize(vWorldPosition + offset).y;",
        "   gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);",
        "}"
    ].join("\n")
};

// Create the gradient material from the shader
const gradientMaterial = new ShaderMaterial({
    vertexShader: gradientShader.vertexShader,
    fragmentShader: gradientShader.fragmentShader,
    uniforms: gradientShader.uniforms,
    side: THREE.BackSide
});


export function getSkyBox() {
    // Create a large sphere to be used as the skybox
    return new THREE.Mesh(new THREE.SphereGeometry(500, 32, 15), gradientMaterial);
}