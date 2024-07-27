onmessage = function(e) {
    const deltaY = e.data;

    // Выполнение тяжелых вычислений для скролла
    const progressChange = deltaY / 1000;

    // Возвращаем результат обратно в основной поток
    postMessage(progressChange);
}