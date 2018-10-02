var Queue = require("../").default;
var assert = require("assert");

var outs = [];

// instantiate with a first task.
var queue = new Queue(function (next) {
    outs.push("Hello, World!");
    next();
});

// push a new task.
queue.push(function (next) {
    setTimeout(function () {
        outs.push("Hi, Ayon!");
        next();
    }, 200);
});

// push a new task and don't pass the `next`.
queue.push(function () {
    assert.deepStrictEqual(outs, ["Hello, World!", "Hi, Ayon!"]);
    outs.pop();
});

// push another functon.
queue.push(function (next) {
    assert.deepEqual(outs, ["Hello, World!"]);
    next();
});

queue.push(function (next) {
    require("./test-promise");
    next();
});

queue.push(function (next) {
    if (parseFloat(process.version.slice(1)) > 7.6) {
        require("./test-async-function");
    }

    next();
});

// pass error
queue.push(function (next) {
    next(new Error);
}).push(function (next, err) {
    assert.equal(err.name, "Error");
    next();
});

queue.push(function () {
    console.log("#### OK ####");
});