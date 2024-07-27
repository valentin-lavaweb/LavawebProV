uniform sampler2D tDiffuse;
uniform float v;
varying vec2 vUv;

void main() {
  vec4 sum = vec4(0.0);
  sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 4.0 * v)) * 0.05;
  sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 3.0 * v)) * 0.09;
  sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 2.0 * v)) * 0.12;
  sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 1.0 * v)) * 0.15;
  sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y)) * 0.16;
  sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 1.0 * v)) * 0.15;
  sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 2.0 * v)) * 0.12;
  sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 3.0 * v)) * 0.09;
  sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 4.0 * v)) * 0.05;
  gl_FragColor = sum;
}