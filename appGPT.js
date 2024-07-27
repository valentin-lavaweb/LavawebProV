import * as THREE from 'three';
import * as dat from 'dat.gui';
import Scene1 from './scenes/Scene1.js';
import Scene2 from './scenes/Scene2.js';
import Scene3 from './scenes/Scene3.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderTransitionPass } from 'three/examples/jsm/postprocessing/RenderTransitionPass.js';

import bloomVertexShader from './shaders/bloomShader/vertex.glsl';
import bloomFragmentShader from './shaders/bloomShader/bloomFragmentShader.glsl';
import { easing } from 'maath';

class RenderScene {
  constructor() {
    // инициализация...
    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupScenes();
    this.setupPostprocessing();
    this.setupGUI();
    this.setupEventListeners();
    this.animate();
  }

  setupRenderer() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    document.body.appendChild(this.renderer.domElement);
  }

  setupScenes() {
    this.scene1 = new Scene1();
    this.scene2 = new Scene2();
    this.scene3 = new Scene3();

    this.scenes = [
      { scene: this.scene1.scene, camera: this.scene1.camera },
      { scene: this.scene2.scene, camera: this.scene2.camera },
      { scene: this.scene3.scene, camera: this.scene3.camera },
    ];

    this.currentScene = 0;
    this.nextScene = 1;
    this.progress = 0;
    this.progressTo = 0;
    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(1);
    this.darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.materials = {};
  }

  setupPostprocessing() {
    const renderPass1 = new RenderPass(this.scenes[0].scene, this.scenes[0].camera);
    const renderPass2 = new RenderPass(this.scenes[1].scene, this.scenes[1].camera);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    const loader = new THREE.TextureLoader();
    const textures = [loader.load('/textures/transition/transition5.png')];
    this.transitionPass = new RenderTransitionPass(this.scenes[0].scene, this.scenes[0].camera, this.scenes[1].scene, this.scenes[1].camera);
    this.transitionPass.setTexture(textures[0]);

    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.addPass(this.transitionPass);
    this.bloomComposer.addPass(this.bloomPass);
    this.bloomComposer.renderToScreen = false;

    const mixPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
        },
        vertexShader: bloomVertexShader,
        fragmentShader: bloomFragmentShader,
      }),
      'baseTexture'
    );


    this.finalComposer = new EffectComposer(this.renderer);
    this.finalComposer.addPass(this.transitionPass);
    this.finalComposer.addPass(mixPass);
    this.finalComposer.addPass(new OutputPass());
  }

  switchScenes() {    
    easing.damp(this, 'progress', this.progressTo, 0.6);
  
    if (this.progress > 1) {
      this.progressTo = 0;
      this.progress = 0;
      this.currentScene = (this.currentScene + 1) % this.scenes.length;
      this.nextScene = (this.currentScene + 1) % this.scenes.length;
      if (this.currentScene === this.scenes.length - 1) {
        this.nextScene = 0;
      }
      this.scenes[this.currentScene].scrollTo = 0;
      this.scenes[this.nextScene].scrollTo = 0;
    } else if (this.progress < 0) {
      if (this.scenes[this.currentScene].scrollTo === 0) {
        this.progressTo = 1;
        this.progress = 1;
        this.currentScene = (this.currentScene - 1 + this.scenes.length) % this.scenes.length;
        this.nextScene = (this.currentScene + 1) % this.scenes.length;
        if (this.currentScene === 0) {
          this.nextScene = 1;
        }
        this.scenes[this.currentScene].scrollTo = 1;
        this.scenes[this.nextScene].scrollTo = 0;
      } else {
        this.progress = 0;
      }
    }

    // Удаляем этот код чтобы увеличить чувствительность скролла, но появится баг, который я ещё не решил.
    if (this.progressTo < 0) {
      this.progressTo = 0;
    }
    if (this.progressTo > 1) {
      this.progressTo = 1;
    }
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    this.switchScenes();
    this.renderPostprocessingTexture();
  }

  renderPostprocessingTexture() {
    this.transitionPass.setTransition(this.progress);
    this.scenes[this.currentScene].scene.traverse((obj) => this.nonBloomed(obj));
    this.bloomComposer.render();
    this.scenes[this.currentScene].scene.traverse((obj) => this.restoreMaterial(obj));
    this.finalComposer.render();
  }

  nonBloomed(obj) {
    if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
      this.materials[obj.uuid] = obj.material;
      obj.material = this.darkMaterial;
    }
  }

  restoreMaterial(obj) {
    if (this.materials[obj.uuid]) {
      obj.material = this.materials[obj.uuid];
      delete this.materials[obj.uuid];
    }
  }

  setupGUI() {
    const gui = new dat.GUI();
    const params = {
      strength: this.bloomPass.strength,
      radius: this.bloomPass.radius,
      threshold: this.bloomPass.threshold,
      progressTo: this.progressTo,
    };

    gui.add(params, 'strength', 0, 2).onChange((value) => {
      this.bloomPass.strength = value;
    });
    gui.add(params, 'radius', 0, 1).onChange((value) => {
      this.bloomPass.radius = value;
    });
    gui.add(params, 'threshold', 0, 4).onChange((value) => {
      this.bloomPass.threshold = value;
    });
    gui.add(params, 'progressTo', 0, 1).onChange((value) => {
      this.progressTo = value;
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.renderer.setSize(this.width, this.height);
    this.bloomComposer.setSize(this.width, this.height);
    this.finalComposer.setSize(this.width, this.height);

    this.scenes.forEach((scene) => {
      scene.camera.aspect = this.width / this.height;
      scene.camera.updateProjectionMatrix();
    });
  }
}

new RenderScene();
