varying float vLife;
uniform vec3 color;
uniform float brightness;
uniform float uTime;

void main() {
    float visiblePhase = 0.2; // Фаза полной видимости
    float alpha = (vLife < visiblePhase) ? 1.0 - pow(vLife / visiblePhase, 2.0) : 0.0; // Быстрое уменьшение прозрачности после видимой фазы

    // Создание круглой формы
    vec2 center = gl_PointCoord - vec2(0.5, 0.5);
    float radius = length(center);
    float gradient = smoothstep(0.5, 0.0, radius); // Радиальный градиент

    alpha *= gradient - vLife; // Применение градиента к альфа-каналу

    if (alpha <= 0.0) discard; // Игнорируем полностью прозрачные партиклы

    gl_FragColor = vec4(color * brightness, alpha);
}