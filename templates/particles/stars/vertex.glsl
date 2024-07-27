uniform float uTime;
uniform vec2 uCursor;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aVelocity;
attribute float aDistance;
attribute float aRadius;
attribute float aAngle;

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vVelocity;
varying float vRadius;
varying float vAngle;
varying vec3 vStartPosition;

float PI = 3.14592653589793238;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax) {
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main() {
    vUv = uv;
    vPosition = position;
    vRadius = aRadius;

    // Движение частиц по кругу 
    // vPosition.xy += mod(uTime - vPosition.xy, vPosition.xy);

    vec4 mvPosition = modelViewMatrix * vec4(vPosition.x, vPosition.y, vPosition.z, 1.0);

    // Размер кружков, получили реальное соотношение с unitами Canvas'а с помощью / 7.67
    // / 7.67 подходит, если используем буферную геометрию
    gl_PointSize = (aSize / 7.67) * uResolution.y;
    gl_Position = projectionMatrix * mvPosition;
}