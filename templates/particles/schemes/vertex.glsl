uniform float uTime;
uniform float sizeScale;
uniform float cycleTime;
attribute float lifeTime; // Время жизни каждого партикла
attribute float randomSize;
varying float vLife;

void main() {
    // float cycleTime = 3.0; // время цикла
    vLife = mod(uTime - lifeTime, cycleTime) / cycleTime; // нормализуем vLife от 0 до 1 для каждого цикла

    vec3 pos = position;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    gl_PointSize = (randomSize * sizeScale * (1.0 / -mvPosition.z)) - vLife;
}