// renderWorker.js

import * as THREE from 'three';
import { EffectComposer, EffectPass, RenderPass, BloomEffect, BlendFunction } from 'postprocessing';
import renderShaderVertex from './shaders/renderShader/vertex.glsl';
import renderShaderFragment from './shaders/renderShader/fragment.glsl';
import Scene1 from './scenes/scene1/Scene1.js';
import Scene2 from './scenes/Scene2.js';
import Scene3 from './scenes/Scene3.js';
import { easing } from 'maath';

let renderer, composer, renderTarget1, renderTarget2;
let scene, camera;
let scenes = [];
let renderShaderMaterial, renderMesh;
let progress = 0, progressTo = 0, currentScene = 0, nextScene = 1;

onmessage = function(e) {
    if (e.data.offscreen) {
        initRenderer(e.data.offscreen);
        initScenes();
        initRenderScene();
        initComposer();
        animate();
    } else if (e.data.resize) {
        handleResize(e.data.width, e.data.height);
    }
};

function initRenderer(offscreen) {
    const width = offscreen.width;
    const height = offscreen.height;
    renderer = new THREE.WebGLRenderer({
        canvas: offscreen,
        context: offscreen.getContext('webgl2'),
        type: THREE.HalfFloatType
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2;
    renderer.powerPreference = "high-performance";

    renderTarget1 = new THREE.WebGLRenderTarget(width, height, {
        type: THREE.HalfFloatType
    });
    renderTarget2 = new THREE.WebGLRenderTarget(width, height, {
        type: THREE.HalfFloatType
    });
}

function initScenes() {
    const scene1 = new Scene1();
    const scene2 = new Scene2();
    const scene3 = new Scene3();

    scenes = [
        { scene: scene1.scene, camera: scene1.camera, scrollTo: scene1.scrollTo },
        { scene: scene2.scene, camera: scene2.camera, scrollTo: scene2.scrollTo },
        { scene: scene3.scene, camera: scene3.camera, scrollTo: scene3.scrollTo }
    ];
}

function initRenderScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#00ffff");
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

    renderShaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            progress: { value: 0.0 },
            tex: { value: undefined },
            tex2: { value: undefined },
            darkness: { value: 1.0 }
        },
        vertexShader: renderShaderVertex,
        fragmentShader: renderShaderFragment
    });
    renderMesh = new THREE.Mesh(geometry, renderShaderMaterial);
    scene.add(renderMesh);
}

function initComposer() {
    composer = new EffectComposer(renderer, {
        frameBufferType: THREE.HalfFloatType
    });
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomEffect = new BloomEffect({
        intensity: .3,
        luminanceSmoothing: 1.5,
        luminanceThreshold: 0.5,
        mipmapBlur: true
    });
    bloomEffect.blendMode.blendFunction = BlendFunction.SCREEN;
    const effectPass = new EffectPass(camera, bloomEffect);
    composer.addPass(effectPass);
}

function renderRenderScene() {
    renderShaderMaterial.uniforms.progress.value = progress;
    scene.visible = false;

    renderer.setRenderTarget(renderTarget1);
    scenes[currentScene].scene.visible = true;
    scenes[nextScene].scene.visible = false;
    renderer.render(scenes[currentScene].scene, scenes[currentScene].camera);
    renderShaderMaterial.uniforms.tex.value = renderTarget1.texture;

    renderer.setRenderTarget(renderTarget2);
    scenes[currentScene].scene.visible = false;
    scenes[nextScene].scene.visible = true;
    renderer.render(scenes[nextScene].scene, scenes[nextScene].camera);
    renderShaderMaterial.uniforms.tex2.value = renderTarget2.texture;

    scenes[currentScene].scene.visible = false;
    scenes[nextScene].scene.visible = false;

    scene.visible = true;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    composer.render();

    [renderTarget1, renderTarget2] = [renderTarget2, renderTarget1];
}

function animate() {
    easing.damp(this, 'progress', progressTo, 0.6);

    if (progress > 1) {
        progressTo = 0;
        progress = 0;
        currentScene = (currentScene + 1) % scenes.length;
        nextScene = (currentScene + 1) % scenes.length;
    }

    renderRenderScene();
    postMessage({ type: 'update' });

    requestAnimationFrame(animate);
}

function handleResize(width, height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderTarget1.setSize(width, height);
    renderTarget2.setSize(width, height);
    composer.setSize(width, height);
}
