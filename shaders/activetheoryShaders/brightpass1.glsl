uniform sampler2D sceneTexture;
uniform float threshold;
varying vec2 vUv;

void main() {
    vec3 color = texture2D(sceneTexture, vUv).rgb;
    float brightness = dot(color, vec3(0.299, 0.587, 0.114)); // Luminance
    if (brightness &gt; threshold) {
        gl_FragColor = vec4(color, 1.0);
    } else {
        gl_FragColor = vec4(0.0);
    }
}