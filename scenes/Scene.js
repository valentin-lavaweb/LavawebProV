import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export default class Scene {
    constructor(props) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.props = {
            number: props.number
        }

        this.prepareScene()
        this.addLights()
        this.addMesh()
        this.loadModel()
    }

    prepareScene() {
        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 5;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color("#181c20")
    }

    addLights() {
        const color = new THREE.Color(5, 5, 50)
        const light1 = new THREE.DirectionalLight(color, 0.1)
        const light2 = new THREE.DirectionalLight(color, 0.1)
        light1.position.copy(new THREE.Vector3(-10, 10, 5))
        light2.position.copy(new THREE.Vector3(0, 10, 5))
        this.scene.add(light1, light2)
    }

    loadModel() {
        // Настройка DRACOLoader
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/'); // Убедитесь, что путь правильный

        // Настройка GLTFLoader с DRACOLoader
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        // Загрузка GLB объекта и добавление его в сцену
        gltfLoader.load('/models/scene1/BuildingScene.glb', (sceneModel) => {
            sceneModel.scene.traverse((node) => {
                if (node.isMesh && node.name === 'ScreenPlane') {
                    console.log(node.material)
                //   node.material = hologramMaterialRef.current;
                }
              });
            this.scene.add(sceneModel.scene)
        }, undefined, (error) => {
            console.error('An error happened while loading the GLB model', error);
        });
    }

    addMesh() {
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh)
    }
  
    // Метод для получения значений props
    getProps() {
        return this.props;
    }
    // Вызываем эту функцию в app.js
    setProps(number) {
        this.props.number = number;
    }

    animate(time) {
        this.mesh.rotation.x = time / 2000;
        this.mesh.rotation.y = time / 1000;
    }
}