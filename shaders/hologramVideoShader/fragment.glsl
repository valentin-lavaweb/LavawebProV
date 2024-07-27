uniform float uTime;
uniform sampler2D uTexture;
varying vec2 vUv;

// Функция для генерации шума
float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;

    // Эффект пикселизации
    float pixelSize = 0.0075;
    uv = floor(uv / pixelSize) * pixelSize;

    // Добавление горизонтального искажения
    // uv.x += sin(uv.y * 10.0 + uTime * 5.0) * 0.1;

    // Хроматическая аберрация
    float glitch = sin(uv.y * 0.1 + uTime * 25.0) * 0.02;
    vec3 colorR = texture2D(uTexture, uv + vec2(glitch, 0.025)).rgb;
    vec3 colorG = texture2D(uTexture, uv).rgb;
    vec3 colorB = texture2D(uTexture, uv - vec2(glitch, 0.025)).rgb;
    vec3 color = vec3(colorR.r, colorG.g, colorB.b);

    // Добавление эффекта шума
    float noise = random(uv * uTime) * 0.025;
    color += vec3(noise);

    // Сканирующие полосы
    float scanline = 0.5 + 0.5 * sin(uv.y * 100.0 + uTime * 20.0);
    // color *= scanline;

    // Уменьшение яркости
    color *= 0.7;

    gl_FragColor = vec4(color, 0.98);
}
