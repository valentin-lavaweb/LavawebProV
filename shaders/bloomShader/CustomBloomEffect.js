import { Uniform, Vector2 } from "three";
import { Effect, BlendFunction } from "postprocessing";
import fragmentShader from "./BloomShader.frag";

export default class CustomBloomEffect extends Effect {
    constructor() {
        super("CustomBloomEffect", fragmentShader, {
            blendFunction: BlendFunction.ADD,
            uniforms: new Map([
                ["bloomIntensity", new Uniform(0.1)],
                ["resolution", new Uniform(new Vector2(window.innerWidth, window.innerHeight))]
            ])
        });
    }
}