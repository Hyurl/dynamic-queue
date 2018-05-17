const Queue = require("../").default;
const assert = require("assert");

var outs = [];

// instantiate with a first task.
var queue = new Queue((next) => {
    outs.push("Hello, World!");
    next();
});

// push a promise.
queue.push(new Promise((resolve) => {
    setTimeout(() => {
        resolve("Hi, Ayon!");
    }, 100);
}).then(value => {
    outs.push(value);
}));

// push a funciton.
queue.push(new Promise(resolve => {
    setTimeout(() => {
        resolve();
    }, 100);
}).then(() => {
    assert.deepStrictEqual(outs, ["Hello, World!", "Hi, Ayon!"]);
    outs.pop();
}));

// push another functon.
queue.push(function (next) {
    assert.deepEqual(outs, ["Hello, World!"]);
    next();
});

queue.push((next) => {
    if (parseFloat(process.version.slice(1)) > 7.6) {
        require("./test-async-function");
    }

    next();
});

queue.push(() => {
    console.log("All tests passed!");
});