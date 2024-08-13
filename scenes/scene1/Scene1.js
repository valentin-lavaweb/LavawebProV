import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import Stars from '../../templates/particles/stars/Stars.js'
import Rain from '../../templates/particles/rain/Rain.js'
import Schemes from '../../templates/particles/schemes/Schemes.js'
import wiresVectors from '../../templates/particles/schemes/schemeVectors/wiresVectors.json';
import screenVectors from '../../templates/particles/schemes/schemeVectors/screenVectors.json';
import vertexHologramVideo from '../../shaders/hologramVideoShader/vertex.glsl'
import fragmentHologramVideo from '../../shaders/hologramVideoShader/fragment.glsl'

export default class Scene1 {
    constructor(props) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.position = new THREE.Vector3()
        this.targetPosition = new THREE.Vector3()
        this.cameraQuaternion = new THREE.Quaternion()
        this.targetQuaternion = new THREE.Quaternion()
        this.lookAtOffset = new THREE.Vector3()
        this.currentPointer = new THREE.Vector2()
        this.targetPointer = new THREE.Vector2()
        this.lookAtPosition = new THREE.Vector3()
        this.pointer = {
            x: 0,
            y: 0
        }
        this.scrollTo = 0
        this.factor = 3

        this.positionPoints = [
            new THREE.Vector3(0, 0.0, 5),
            new THREE.Vector3(-3, -1, 5),
            new THREE.Vector3(-10.43, -5.21, 9.01),
            new THREE.Vector3(1.67, -9.0, 10.47),
            new THREE.Vector3(7.0, -9.2, 9.5),
            new THREE.Vector3(7.0, -11.2, 9.5)
        ]
        this.targetPoints = [
            new THREE.Vector3(0, 3.5, -10),
            new THREE.Vector3(2.5, 3.5, -10),
            new THREE.Vector3(-3, -2.45, 0.27),
            new THREE.Vector3(-3.5, -3.05, 1.58),
            new THREE.Vector3(-3.5, -2.85, 0.11),
            new THREE.Vector3(-3.5, -4.85, 0.11)
        ]
        this.positionCurve = new THREE.CatmullRomCurve3(this.positionPoints)
        this.targetCurve = new THREE.CatmullRomCurve3(this.targetPoints)

        this.init()
    }

    init() {
        this.prepareScene()
        this.addParticles()
        this.initCameraPosition()
        this.loadModel()
        this.addLights()

        // EVENT LISTENERS
        this.initListeners()
    }

    prepareScene() {
        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 5;
        this.scene = new THREE.Scene();
        const factor = 0.002
        this.scene.background = new THREE.Color(1 * factor, 1 * factor, 2 * factor)
    }

    addParticles() {
        const stars = new Stars();
        this.scene.add(stars.particles)

        this.rain1 = new Rain({xScale: 40, zScale: 40, zPosition: 0, lengthScale: 1, count: 10000, opacity: 0.03, speedScale: 1});
        this.rain2 = new Rain({xScale: 25, zScale: 8, zPosition: 7, lengthScale: 0.5, count: 10000, opacity: 0.03, speedScale: 0.25});
        this.scene.add(this.rain1.particles)
        this.scene.add(this.rain2.particles)

        this.wires = new Schemes({vectors: wiresVectors, speed: 0.00007, particlesCount: 1500, delay: 10})
        this.screenSchemes = new Schemes({vectors: screenVectors, speed: 0.00005, particlesCount: 500, delay: 0.1})
        this.scene.add(this.wires.particles)
        this.scene.add(this.screenSchemes.particles)
    }

    loadModel() {
        
        // VIDEOTEXTURE
        this.frameCount = 0
        
        const video = document.createElement('video');
        video.src = '/videos/showreel2023.mp4';
        video.loop = true;
        video.muted = true;
        video.play()

        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        this.hologramMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: {value: 0},
                uTexture: {value: videoTexture}
            },
            vertexShader: vertexHologramVideo,
            fragmentShader: fragmentHologramVideo,
        })
        this.hologramMaterial.transparent = true


        // Настройка DRACOLoader
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/'); // Убедитесь, что путь правильный

        // Настройка GLTFLoader с DRACOLoader
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);
        
        // Загрузка GLB объекта и добавление его в сцену
        gltfLoader.load('/models/scene1/BuildingScene.glb', (sceneModel) => {

            // ADD BLOOM
            sceneModel.scene.traverse((child) => {
                if (child.isMesh && 
                    (child.material.name === 'BloomVeryHigh' || 
                     child.material.name === 'BloomHigh' ||
                     child.material.name === 'BloomMedium' ||
                     child.material.name === 'BloomLow' ||
                     child.material.name === 'BloomWindow'
                    )
                ){
                    child.material.toneMapped = true
                    child.layers.toggle(1)
                }
                if (child.isMesh && child.name === 'ScreenPlane') {
                    child.material = this.hologramMaterial
                }
            });
            this.scene.add(sceneModel.scene)
        }, undefined, (error) => {
            console.error('An error happened while loading the GLB model', error);
        });
    }

    addLights() {
        const color = new THREE.Color(10 / 30, 10 / 30, 30 / 30)
        const light1 = new THREE.DirectionalLight(color, 0.5)
        const light2 = new THREE.DirectionalLight(color, 0.5)
        const light3 = new THREE.DirectionalLight(color, 0.25)

        light1.position.copy(new THREE.Vector3(-15, 10, 5))
        light2.position.copy(new THREE.Vector3(0, 10, 5))
        light3.position.copy(new THREE.Vector3(15, 10, 5))
        // light3.position.copy(new THREE.Vector3(300, 200, 50))
        this.scene.add(light1, light2, light3)
    }

    initCameraPosition() {
        this.camera.position.copy(this.positionPoints[0]);
        this.camera.lookAt(this.targetPoints[0]);
        this.camera.updateProjectionMatrix();
    }

    updateCamera() {
        this.camera.position.lerp(this.positionPoints[0], 0.05);
        this.camera.lookAt(this.targetPosition);
        this.currentPointer.lerp(this.targetPointer, 0.1);

        this.lookAtOffset.set(
            this.targetPosition.x + (this.currentPointer.x) * this.factor,
            this.targetPosition.y + (this.currentPointer.y) * this.factor,
            this.targetPosition.z
        );

        this.lookAtPosition.lerp(this.lookAtOffset, 0.1);
        this.camera.lookAt(this.lookAtPosition);
    }

    initListeners() {
        const handleMouseMove = (e) => {
            this.targetPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }
        window.addEventListener('mousemove', handleMouseMove);


        const handleWheel = (e) => {
            // Скролл вверх
            if (e.deltaY > 0) {
                this.positionPoints[0].z += 0.5
                this.positionPoints[0].z = Math.min(this.positionPoints[0].z, 30)
            }
            if (e.deltaY < 0) {
                this.positionPoints[0].z -= 0.5
                this.positionPoints[0].z = Math.max(this.positionPoints[0].z, 3)
            }
        }
        window.addEventListener('wheel', handleWheel);


        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp') {
                this.positionPoints[0].y += 0.5;
            }
            if (e.key === 'ArrowDown') {
                this.positionPoints[0].y -= 0.5;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
    };
    
  
    animate() {
        this.frameCount++;
        if (this.frameCount % 2 === 0) {
          this.hologramMaterial.uniforms.uTime.value += 0.01;
        }
        this.rain1.animate()
        this.rain2.animate()
        this.wires.animate()
        this.screenSchemes.animate()
        this.updateCamera()
    }
}
