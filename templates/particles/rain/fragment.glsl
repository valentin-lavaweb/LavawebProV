uniform float uOpacity;
varying float vLength;
void main() {
    vec4 colorStart = vec4(0.5, 0.5, 0.6, 0.0);
    vec4 colorEnd = vec4(0.5, 0.5, 0.6, uOpacity);
    vec4 color = mix(colorStart, colorEnd, vLength);
    gl_FragColor = color;
}