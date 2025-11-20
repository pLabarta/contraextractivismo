export default `
uniform float uProgress;
uniform vec3 uYellowColor;
uniform vec3 uBlackColor;
uniform float uMinX;
uniform float uMaxX;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    // Calculate the boundary based on progress using actual model bounds
    float boundary = mix(uMinX, uMaxX, uProgress);

    // Determine if this fragment should be yellow or black
    vec3 color = vPosition.x < boundary ? uYellowColor : uBlackColor;

    // Simple lighting based on normal
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diffuse = max(dot(vNormal, lightDir), 0.3);

    gl_FragColor = vec4(color * diffuse, 1.0);
}
`;
