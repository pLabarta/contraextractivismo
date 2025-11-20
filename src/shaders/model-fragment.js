export default `
uniform float uProgress;
uniform vec3 uYellowColor;
uniform vec3 uBlackColor;
uniform float uMinX;
uniform float uMaxX;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    // Calculate distance from center to edge for radial sweep
    float maxDist = length(vec2(uMaxX - uMinX, uMaxX - uMinX)) * 0.5;
    float distFromCenter = length(vPosition.xy);

    // Progress from 0 to maxDist
    float boundary = uProgress * maxDist;

    // Determine if this fragment should be yellow or black
    vec3 color = distFromCenter < boundary ? uYellowColor : uBlackColor;

    // Simple lighting based on normal
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diffuse = max(dot(vNormal, lightDir), 0.3);

    gl_FragColor = vec4(color * diffuse, 1.0);
}
`;
