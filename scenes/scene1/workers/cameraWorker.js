// cameraWorker.js
self.onmessage = function(e) {
    const { currentScroll, scrollTo, delta, positionPoints, targetPoints } = e.data;

    // Линейная интерполяция (lerp) для обновления текущего скролла
    let updatedScroll = currentScroll + (scrollTo - currentScroll) * delta * 5;
    updatedScroll = Math.min(1, Math.max(0, updatedScroll));

    // Расчёт новой позиции и цели на основе кривых
    const position = interpolatePosition(positionPoints, updatedScroll);
    const targetPosition = interpolatePosition(targetPoints, updatedScroll);

    self.postMessage({ updatedScroll, position, targetPosition });
};

// Интерполяция позиции на основе кривой
function interpolatePosition(points, t) {
    const p = Math.floor(t * (points.length - 1));
    const weight = t * (points.length - 1) - p;
    const p0 = points[p];
    const p1 = points[Math.min(p + 1, points.length - 1)];
    return {
        x: p0.x * (1 - weight) + p1.x * weight,
        y: p0.y * (1 - weight) + p1.y * weight,
        z: p0.z * (1 - weight) + p1.z * weight
    };
}