const { Queue } = require("../");
const assert = require("assert");

var outs = [];

// instantiate with a first task.
var queue = new Queue((next) => {
    outs.push("Hello, World!");
    next();
});

// push a promise.
queue.push(Promise.resolve("Hi, Ayon!").then(value => {
    outs.push(value);
}));

// push a funciton.
queue.push(function (next) {
    assert.deepStrictEqual(outs, ["Hello, World!", "Hi, Ayon!"]);
    outs.pop();
    next();
});

// push another functon.
queue.push(function (next) {
    assert.deepEqual(outs, ["Hello, World!"]);
    next();
});

queue.push((next) => {
    if (parseFloat(process.version.slice(1, 3)) > 7.6) {
        require("./test-async-function");
    }

    next();
});

queue.push(() => {
    console.log("All tests passed!");
});