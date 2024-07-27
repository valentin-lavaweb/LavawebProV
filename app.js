import { EffectComposer, EffectPass, RenderPass, BloomEffect, BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import Scene1 from './scenes/scene1/Scene1.js';
import Scene2 from './scenes/Scene2.js';
import Scene3 from './scenes/Scene3.js';
import renderShaderVertex from './shaders/renderShader/vertex.glsl'
import renderShaderFragment from './shaders/renderShader/fragment.glsl'
import { easing } from 'maath';
import VirtualScroll from 'virtual-scroll';

class RenderScene {
  constructor(props) {

    this.initRenderer()
    this.initScenes()
    // this.initTestScene()
    this.initRenderScene()
    this.initComposer()
    this.initScroll()

    this.frameCount = 0;
    this.lastFrameTime = performance.now();

    this.resize()
    this.renderer.setAnimationLoop(this.animate);
    // this.settings()
  }

  initRenderer() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      type: THREE.HalfFloatType
    });

    // Проверка на слабое устройство
    const isLowPerformanceDevice = navigator.hardwareConcurrency < 4 || (window.innerWidth > 768 && window.innerWidth <= 1440);
    if (isLowPerformanceDevice) {
        this.renderer.setSize(this.width / 2, this.height / 2);
    } else {
        this.renderer.setSize(this.width, this.height);
    }


    this.renderer.setPixelRatio(1)
    this.renderer.setSize(this.width, this.height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 2;
    this.renderer.powerPreference = "high-performance"
    document.body.appendChild(this.renderer.domElement);
    // Включение фрустумного отсечения
    this.renderer.frustumCulled = true;


    this.renderTarget1 = new THREE.WebGLRenderTarget(this.width, this.height, {
      type: THREE.HalfFloatType
    });
    this.renderTarget2 = new THREE.WebGLRenderTarget(this.width, this.height, {
      type: THREE.HalfFloatType
    });
  }

  initScenes() {
    this.scene1 = new Scene1();
    this.scene2 = new Scene2();
    this.scene3 = new Scene3();

    this.scenes = [
      {
        scene: this.scene1.scene,
        camera: this.scene1.camera,
        scrollTo: this.scene1.scrollTo,
        currentScroll: 0
      },
      {
        scene: this.scene2.scene,
        camera: this.scene2.camera,
        scrollTo: this.scene2.scrollTo,
        currentScroll: 0
      },
      {
        scene: this.scene3.scene,
        camera: this.scene3.camera,
        scrollTo: this.scene3.scrollTo,
        currentScroll: 1
      }
    ]
  }

  initTestScene() {
    // Инициализация сцены, камеры и рендерера
    this.testScene = new THREE.Scene();
    this.testScene.background = new THREE.Color('black')
    this.testCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.testCamera.position.z = 5

    // Добавление объектов на сцену с насыщенными цветами
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(1, 1, 1), emissive: new THREE.Color(0, 0, 10), emissiveIntensity: 10 });
    const cube = new THREE.Mesh(geometry, material);
    this.testScene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 1, 1);
    this.testScene.add(light);
  }

  initRenderScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color("#00ffff")
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 5

    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

    this.renderShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        progress: { value: 0.0 },
        tex: { value: undefined },
        tex2: { value: undefined },
        darkness: { value: 1.0 }
      },
      vertexShader: renderShaderVertex,
      fragmentShader: renderShaderFragment
    });
    this.renderMesh = new THREE.Mesh(geometry, this.renderShaderMaterial);

    this.scene.add(this.renderMesh)
  }
  renderRenderScene() {
    this.renderShaderMaterial.uniforms.progress.value = this.progress
    this.scene.visible = false

    // РЕНДЕР ПЕРВОЙ СЦЕНЫ В RENDERTARGET1
    this.renderer.setRenderTarget(this.renderTarget1);
    this.scenes[this.currentScene].scene.visible = true
    this.scenes[this.nextScene].scene.visible = false
    this.renderer.render(this.scenes[this.currentScene].scene, this.scenes[this.currentScene].camera);
    this.renderShaderMaterial.uniforms.tex.value = this.renderTarget1.texture
    
    // РЕНДЕР ВТОРОЙ СЦЕНЫ В RENDERTARGET2
    this.renderer.setRenderTarget(this.renderTarget2);
    this.scenes[this.currentScene].scene.visible = false
    this.scenes[this.nextScene].scene.visible = true
    this.renderer.render(this.scenes[this.nextScene].scene, this.scenes[this.nextScene].camera);
    this.renderShaderMaterial.uniforms.tex2.value = this.renderTarget2.texture
    
    // СКРЫВАЕМ СЦЕНЫ
    this.scenes[this.currentScene].scene.visible = false
    this.scenes[this.nextScene].scene.visible = false

    // РЕНДЕРИМ ОСНОВНУЮ СЦЕНУ
    this.scene.visible = true
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, this.camera)

    // Применение постобработки с помощью ping-pong рендеринга
    this.composer.render();

    // Переключение рендер-таргетов
    [this.renderTarget1, this.renderTarget2] = [this.renderTarget2, this.renderTarget1];
  }

  initScroll() {
      // SCROLL
      this.currentScene = 0
      this.nextScene = 1
      this.progress = 0
      this.progressTo = 0
      this.lastScrollTime = 0;
      this.scrollCooldown = 100; // В миллисекундах
      const scrollFunction = (e) => {
        // this.progressTo -= e.deltaY / 1000;
        console.log(this.progressTo, 
          this.scenes[0].scrollTo,
          this.scenes[1].scrollTo,
          this.scenes[2].scrollTo
        )
        const scrollCoefficent = 5000;
        if (this.progress === 0) {
          this.scenes[this.currentScene].scrollTo -= e.deltaY / scrollCoefficent;
          this.scenes[this.currentScene].scrollTo = Math.min(Math.max(this.scenes[this.currentScene].scrollTo, 0), 1);
        }
    
        if (this.scenes[this.currentScene].scrollTo === 1) {
          this.progressTo -= e.deltaY / 1000;
        } else if (this.scenes[this.currentScene].scrollTo === 0 && this.progress === 0) {
          this.progressTo -= e.deltaY / 1000;
        }
    
        this.setScrollScenes()
      };
      
      const vs = new VirtualScroll();
      vs.on(throttle(scrollFunction, 100));

      function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            const context = this;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
      }
  }
  switchScenes() {    
    easing.damp(this, 'progress', this.progressTo, 0.6);
    this.scene1.setProgress(this.progress)
  
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
  setScrollScenes() {
    this.scene1.setScrollTo(this.scenes[0].scrollTo)
  }
  getScenesCurrentScrolls() {
    this.scenes[0].currentScroll = this.scene1.getCurrentScroll()
  }

  initComposer() {
    this.composer = new EffectComposer(this.renderer, {
      frameBufferType: THREE.HalfFloatType
    });
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.bloomEffect = new BloomEffect({
      intensity: .3,
      luminanceSmoothing: 1.5,
      luminanceThreshold: 0.5,
      mipmapBlur: true,
    });
    this.bloomEffect.blendMode.blendFunction = BlendFunction.SCREEN
    const effectPass = new EffectPass(this.camera, this.bloomEffect);
    this.composer.addPass(effectPass);
  }

  resize() {
    const handleResize = () => {     
      this.renderTarget1.setSize(window.innerWidth, window.innerHeight);
      this.renderTarget2.setSize(window.innerWidth, window.innerHeight);
      this.scenes.forEach(scene => {
        scene.camera.aspect = window.innerWidth / window.innerHeight;
        scene.camera.updateProjectionMatrix();
      });
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      // this.bloomComposer.setSize(window.innerWidth, window.innerHeight);
      // this.finalComposer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
  }

  settings() {
    const gui = new dat.GUI();
    const params = {
      intensity: this.bloomEffect.intensity,
      smoothing: this.bloomEffect.luminanceMaterial.uniforms.smoothing.value,
      threshold: this.bloomEffect.luminanceMaterial.uniforms.threshold.value,
    };


    gui.add(params, 'intensity', 0, 2).onChange(value => {
      this.bloomEffect.intensity = value
    });
    gui.add(params, 'smoothing', 0, 4).onChange(value => {
      this.bloomEffect.luminanceMaterial.uniforms.smoothing.value = value
    });
    gui.add(params, 'threshold', 0, 4).onChange(value => {
      this.bloomEffect.luminanceMaterial.uniforms.threshold.value = value
    });
	}

  animate = (time) => {

    const fps = this.calculateFPS();
    if (fps < 30) {
        this.renderer.setPixelRatio(0.9)
    } else {
        this.renderer.setPixelRatio(window.devicePixelRatio)
    }
    
    this.renderRenderScene();
    this.switchScenes();
    this.scene1.animate();
  }

  calculateFPS() {
    const now = performance.now();
    this.frameCount++;
    const delta = now - this.lastFrameTime;
    if (delta >= 1000) {
        const fps = this.frameCount / (delta / 1000);
        this.frameCount = 0;
        this.lastFrameTime = now;
        return fps;
    }
    return 60; // Возвращаем 60 по умолчанию
  }
}

new RenderScene();