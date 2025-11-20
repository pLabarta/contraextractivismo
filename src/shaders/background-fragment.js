export default `
uniform vec3 uColorDark;
uniform vec3 uColorLight;

varying vec2 vUv;
varying float vElevation;

void main() {
    // Create gradient based on elevation and position
    float mixStrength = (vElevation + 0.5) * 0.5 + 0.5;
    mixStrength = clamp(mixStrength, 0.0, 1.0);

    // Add some variation based on UV
    float uvMix = (vUv.x + vUv.y) * 0.1;

    vec3 color = mix(uColorDark, uColorLight, mixStrength + uvMix);

    // Create mesh grid with nodes
    float gridSize = 20.0; // Number of grid cells
    vec2 grid = fract(vUv * gridSize);

    // Thin lines
    float lineWidth = 0.015;
    float gridLine = 0.0;
    if (grid.x < lineWidth || grid.x > 1.0 - lineWidth ||
        grid.y < lineWidth || grid.y > 1.0 - lineWidth) {
        gridLine = 0.25;
    }

    // Create nodes at intersections (small circles)
    vec2 nodePos = fract(vUv * gridSize);
    vec2 centerDist = abs(nodePos - vec2(0.0, 0.0));
    vec2 centerDist2 = abs(nodePos - vec2(1.0, 1.0));

    float nodeRadius = 0.08;
    float node = 0.0;

    // Check distance to grid intersections
    if (length(centerDist) < nodeRadius || length(centerDist2) < nodeRadius) {
        node = 0.6;
    }

    // Combine lines and nodes
    float meshIntensity = max(gridLine, node);
    color = mix(color, uColorLight * 1.8, meshIntensity);

    gl_FragColor = vec4(color, 1.0);
}
`;
