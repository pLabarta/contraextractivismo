export default `
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    // Use world position for consistent boundary checking after rotation
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vPosition = worldPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
