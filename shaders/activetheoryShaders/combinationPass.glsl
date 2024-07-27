uniform sampler2D originalScene;
uniform sampler2D bloomTexture;
uniform float bloomIntensity;
varying vec2 vUv;

void main() {
    vec4 originalColor = texture2D(originalScene, vUv);
    vec4 bloomColor = texture2D(bloomTexture, vUv);
    gl_FragColor = mix(originalColor, bloomColor, bloomIntensity);
}