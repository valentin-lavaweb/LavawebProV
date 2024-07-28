// scrollWorker.js
self.onmessage = function(e) {
    const { deltaY, currentSceneScrollTo } = e.data;
    let progressTo = 0;
    let scrollTo = currentSceneScrollTo;

    const scrollCoefficent = 5000;
    if (progressTo === 0) {
        scrollTo -= deltaY / scrollCoefficent;
        scrollTo = Math.min(Math.max(scrollTo, 0), 1);
    }

    if (scrollTo === 1) {
        progressTo -= deltaY / 1000;
    } else if (scrollTo === 0 && progressTo === 0) {
        progressTo -= deltaY / 1000;
    }

    // Отправка данных обратно в основной поток
    self.postMessage({ progressTo, scrollTo });
};
