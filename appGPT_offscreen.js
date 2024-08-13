// index.js

const renderWorker = new Worker(new URL('./renderWorker.js', import.meta.url), { type: 'module' });

const mainCanvas = document.createElement('canvas');
mainCanvas.width = window.innerWidth;
mainCanvas.height = window.innerHeight;
document.body.appendChild(mainCanvas);

const offscreen = mainCanvas.transferControlToOffscreen();

renderWorker.postMessage({ offscreen }, [offscreen]);

window.addEventListener('resize', () => {
    renderWorker.postMessage({
        resize: true,
        width: window.innerWidth,
        height: window.innerHeight
    });
});

renderWorker.onmessage = function(e) {
    if (e.data.type === 'update') {
        // Обновление или другие действия по запросу от воркера
    }
};
