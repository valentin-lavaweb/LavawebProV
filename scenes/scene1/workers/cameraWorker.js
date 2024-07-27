// cameraWorker.js
import * as THREE from 'three'

self.onmessage = function(e) {
    const { currentScroll, scrollTo, positionPoints, targetPoints, delta, progress, pointer, factor } = e.data;

    // Интерполяция прокрутки
    let updatedScroll = currentScroll + (scrollTo - currentScroll) * delta * 5;
    updatedScroll = Math.min(1, updatedScroll);
    updatedScroll = Math.max(0, updatedScroll);

    // Функция линейной интерполяции (lerp)
    function lerp(v0, v1, t) {
        return v0 * (1 - t) + v1 * t;
    }

    // Вычисление новых позиций и кватернионов камеры
    const positionCurve = new THREE.CatmullRomCurve3(positionPoints.map(p => new THREE.Vector3(p.x, p.y, p.z)));
    const targetCurve = new THREE.CatmullRomCurve3(targetPoints.map(p => new THREE.Vector3(p.x, p.y, p.z)));

    const position = positionCurve.getPointAt(updatedScroll);
    const targetPosition = targetCurve.getPointAt(updatedScroll);

    const cameraPosition = new THREE.Vector3().lerpVectors(position, targetPosition, delta * 1.25);

    const targetQuaternion = new THREE.Quaternion();
    const cameraQuaternion = new THREE.Quaternion().slerp(targetQuaternion, delta * 3.25);

    const currentPointer = new THREE.Vector2(pointer.x, pointer.y);
    const targetPointer = new THREE.Vector2(
        progress === 0 ? pointer.x : pointer.x * 0.25,
        progress === 0 ? pointer.y : pointer.y * 0.25
    );

    currentPointer.lerp(targetPointer, delta * 5);

    const lookAtOffset = new THREE.Vector3(
        targetPosition.x + (currentPointer.x) * factor,
        targetPosition.y + (currentPointer.y) * factor,
        targetPosition.z
    );

    const lookAtPosition = new THREE.Vector3().lerp(lookAtOffset, delta * 5);

    postMessage({ cameraPosition, lookAtPosition, updatedScroll, targetPosition });
};
