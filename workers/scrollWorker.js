onmessage = function(e) {
    const data = e.data;

    const result = performHeavyComputations(data);

    postMessage(result);
}

function performHeavyComputations(data) {
    let result = 0;
    for (let i = 0; i < data.length; i++) {
        result += data[i] * Math.random();
    }
    return result;
}