import * as THREE from 'three';
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

export default class Rain {
    constructor({xScale, zScale, zPosition, lengthScale, count, opacity, speedScale}) {
        this.clock = new THREE.Clock()
        this.particles(xScale, zScale, zPosition, lengthScale, count, opacity, speedScale)
    }

    particles(xScale, zScale, zPosition, lengthScale, count, opacity, speedScale) {

        const positions = new Float32Array(count * 6);
        const lengths = new Float32Array(count * 2);

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * xScale;
            const y = Math.random() * 220 * speedScale * 2 - 20;
            const z = (Math.random() - 0.5) * zScale + zPosition;
            const length = Math.random() * (1.25 * lengthScale - 0.05) + 0.05;

            positions.set([x, y, z, x, y - length, z], i * 6);
            lengths.set([0.0, 1.0], i * 2);
        }
        
        // Создаём гемотерию и материал
        this.particlesGeometry = new THREE.BufferGeometry()
        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particlesGeometry.setAttribute('lineLength', new THREE.BufferAttribute(lengths, 1));

        this.particlesMaterial = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uTime: { value: 0 },
                uOpacity: { value: opacity },
                uSpeed: { value: speedScale },
            },
            transparent: true,
            depthWrite: false,
        })

        this.particles = new THREE.LineSegments(this.particlesGeometry, this.particlesMaterial)
        this.particles.frustumCulled = false;
    }

    animate() {
        const delta = this.clock.getDelta();
        this.particlesMaterial.uniforms.uTime.value += delta
        if (this.particlesMaterial.uniforms.uTime.value > 4) {
            this.particlesMaterial.uniforms.uTime.value = 0;
        }
    }
}