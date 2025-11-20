export default `
uniform float uTime;
uniform float uWaveSpeed;
uniform float uWaveAmplitude;

varying vec2 vUv;
varying float vElevation;

void main() {
    vUv = uv;

    vec3 pos = position;

    // Create slow moving waves
    float wave1 = sin(pos.x * 0.5 + uTime * uWaveSpeed) * uWaveAmplitude;
    float wave2 = sin(pos.y * 0.3 + uTime * uWaveSpeed * 0.8) * uWaveAmplitude;
    float wave3 = cos(pos.x * 0.3 - pos.y * 0.4 + uTime * uWaveSpeed * 0.6) * uWaveAmplitude * 0.5;

    pos.z = wave1 + wave2 + wave3;
    vElevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;
