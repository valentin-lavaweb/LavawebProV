uniform float bloomIntensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 color = inputColor;
    float maxColor = max(color.r, max(color.g, color.b));
    float bloom = step(0.5, maxColor) * (maxColor - 0.5) * bloomIntensity; // Усиление свечения
    outputColor = vec4(color.rgb + bloom * vec3(1.0, 1.0, 1.0), color.a); // Добавляем свечение ко всем каналам
}