import * as THREE from 'three';
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

export default class Stars {
    constructor() {
        this.particles()
    }

    particles() {
        
        // Функция, которая рандомно возвращает число
        function range(start, end){
            let r = Math.random()
            return r * (end - start) + start
        }
        
        const number = 1000;
        const positions = new Float32Array(number * 3)
        const sizes = new Float32Array(number)
        const radius = new Float32Array(number)
        // Задаем здесь значения для атрибутов, для каждого партикля
        for (let i = 0; i < number; i++) {
            let i3 = i * 3;
            const sphereRadius = 180; // радиус полусферы
            const theta = Math.PI * Math.random() * 0.58; // угол от 0 до PI/2
            const phi = 2 * Math.PI * Math.random(); // угол от 0 до 2*PI
    
            positions[i3] = sphereRadius * Math.sin(theta) * Math.cos(phi); // X
            positions[i3 + 1] = sphereRadius * Math.cos(theta); // Y, высота полусферы
            positions[i3 + 2] = sphereRadius * Math.sin(theta) * Math.sin(phi); // Z, глубина
    
            sizes[i] = range(0.03, 0.07); // размер каждого партикля
        }

        // Создаём гемотерию и материал
        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        particlesGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1))
        particlesGeometry.setAttribute("aRadius", new THREE.BufferAttribute(radius, 1))
        particlesGeometry.setIndex(null)
        particlesGeometry.computeVertexNormals()

        const particlesMaterial = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uResolution: new THREE.Uniform(new THREE.Vector2(window.innerWidth, window.innerHeight)),
                uColor: {value: new THREE.Vector3(5.0, 5.0, 10.0)}, //Не рекомендую увеличивать значения цвета, лучше работать с uBrightness для яркости, эффект такой же
                uBrightness: {value: 1.0}, //Влияет на яркость партиклей, не жрёт ФПС.
                uBlur: {value: 0.002}, //Влияет на блюр партиклей, не жрёт фпс
            },
            // ОБЯЗАТЕЛЬНО ВЫСТАВИТЬ
            transparent: true,
        })
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial)
    }
}