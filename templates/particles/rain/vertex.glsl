uniform float uTime;
uniform float uSpeed;
attribute float lineLength;
varying float vLength;
void main() {
    vec3 pos = position;
    pos.y -= uTime * 30.0 * uSpeed;
    vLength = lineLength;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}