import * as THREE from 'three';
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

export default class Schemes {
    constructor({vectors, speed, particlesCount, delay}) {

        this.clock = new THREE.Clock()
        this.particles(vectors, speed, particlesCount, delay)
    }

    particles(vectors, speed, particlesCount, delay) {
        const randomRange = (min, max) => Math.random() * (max - min) + min;
        const curvesArray = [];
        const curvesCount = vectors.objects.length
        function generateCurvePoints(index){
            let points = [];
            const pointsArray = vectors.objects[index].points
            for (let i = 0; i < pointsArray.length; i++) {
                points.push(new THREE.Vector3(pointsArray[i].x, pointsArray[i].y, pointsArray[i].z));
            }
            return points;
        };

        for (let i = 0; i < curvesCount; i++) {
            curvesArray.push(new THREE.CatmullRomCurve3(generateCurvePoints(i), false, 'catmullrom', 0.0));
        }


        const pointsArray = [];
        const lifesArray = [];
        const sizesArray = [];
        const particlesCountArray = particlesCount * curvesCount;
        const timeOffsets = curvesArray.map(() => randomRange(1, curvesArray.length * delay));

        for (let i = 0; i < particlesCountArray; i++) {
            const curveIndex = Math.floor(Math.random() * curvesArray.length); // случайный выбор кривой
            const curve = curvesArray[curveIndex];
            const t = i / particlesCountArray;
            const point = curve.getPoint(t);
    
            pointsArray.push(point.x + Math.random() * 0.0015, point.y + Math.random() * 0.0015, point.z + Math.random() * 0.0015);
            const lifeTimeWithOffset = i * speed + timeOffsets[curveIndex]; // добавляем смещение времени
            lifesArray.push(lifeTimeWithOffset);
            sizesArray.push(randomRange(2, 4));
        }
        const positions = new Float32Array(pointsArray);
        const lifes = new Float32Array(lifesArray);
        const sizes = new Float32Array(sizesArray);
        
        // Создаём гемотерию и материал
        const particlesGeometry = new THREE.BufferGeometry()
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('lifeTime', new THREE.BufferAttribute(lifes, 1));
        particlesGeometry.setAttribute('randomSize', new THREE.BufferAttribute(sizes, 1));

        this.particlesMaterial = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uTime:  { value: 0},
                color: { value: new THREE.Vector3(0.2, 0.2, 1)},
                brightness: { value: 40.0},
                sizeScale: { value: 0.01},
                cycleTime: { value: 4.0}
            },
            // depthTest: true,
            // depthWrite: true,
            // transparent: true,
            // blending: THREE.AdditiveBlending
        })
        // particlesMaterial.depthTest = true
        // particlesMaterial.depthWrite = true
        // particlesMaterial.transparent = true
        // particlesMaterial.blending = THREE.AdditiveBlending

        this.particles = new THREE.Points(particlesGeometry, this.particlesMaterial)
        // this.particles.frustumCulled = false;
    }

    animate() {
        const delta = this.clock.getDelta();
        this.particlesMaterial.uniforms.uTime.value += delta;
    }
}