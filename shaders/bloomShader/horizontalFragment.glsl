uniform sampler2D tDiffuse;
uniform float h;
varying vec2 vUv;

void main() {
  vec4 sum = vec4(0.0);
  sum += texture2D(tDiffuse, vec2(vUv.x - 4.0 * h, vUv.y)) * 0.05;
  sum += texture2D(tDiffuse, vec2(vUv.x - 3.0 * h, vUv.y)) * 0.09;
  sum += texture2D(tDiffuse, vec2(vUv.x - 2.0 * h, vUv.y)) * 0.12;
  sum += texture2D(tDiffuse, vec2(vUv.x - 1.0 * h, vUv.y)) * 0.15;
  sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y)) * 0.16;
  sum += texture2D(tDiffuse, vec2(vUv.x + 1.0 * h, vUv.y)) * 0.15;
  sum += texture2D(tDiffuse, vec2(vUv.x + 2.0 * h, vUv.y)) * 0.12;
  sum += texture2D(tDiffuse, vec2(vUv.x + 3.0 * h, vUv.y)) * 0.09;
  sum += texture2D(tDiffuse, vec2(vUv.x + 4.0 * h, vUv.y)) * 0.05;
  gl_FragColor = sum;
}