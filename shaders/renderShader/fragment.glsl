varying vec2 vUv;
uniform sampler2D tex;
uniform sampler2D tex2;
uniform float progress;
uniform float darkness;

void main() {    
    vec4 t = texture2D(tex, vUv);
    vec4 t1 = texture2D(tex2, vUv);

    // Calculate diagonal gradient
    float diagonal = (vUv.y / 1.45) - (vUv.x * 0.15);
    float sweep = step(diagonal, progress - 0.225);

    vec4 finalTexture = mix(t, t1, sweep);
    finalTexture.rgb *= darkness;
    gl_FragColor = finalTexture;

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}