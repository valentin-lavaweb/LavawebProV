uniform sampler2D tDiffuse;
uniform float threshold;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  if (brightness > threshold) {
    gl_FragColor = color;
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}