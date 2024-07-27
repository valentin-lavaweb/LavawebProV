uniform sampler2D sceneTexture;
uniform float blurAmount;
uniform float resolution;
varying vec2 vUv;

void main() {
    vec2 texOffset = blurAmount / resolution;
    vec4 result = texture2D(sceneTexture, vUv) * 0.227027;
    result += texture2D(sceneTexture, vUv + vec2(texOffset, 0.0)) * 0.316216;
    result += texture2D(sceneTexture, vUv - vec2(texOffset, 0.0)) * 0.316216;
    result += texture2D(sceneTexture, vUv + vec2(2.0 * texOffset, 0.0)) * 0.070270;
    result += texture2D(sceneTexture, vUv - vec2(2.0 * texOffset, 0.0)) * 0.070270;
    gl_FragColor = result;
}