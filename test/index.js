require("source-map-support/register");
var Queue = require("../").default;
var assert = require("assert");
var logs = require("./logs");

var outs = [];
var oldNode = parseFloat(process.version.slice(1)) < 7.6;

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

// push another function.
queue.push(function (next) {
    assert.deepEqual(outs, ["Hello, World!"]);
    logs.push("AAA");
    next();
});

// push a function that will return a queue
queue.push(function () {
    return require("./test-promise");
});

queue.push(function () {
    return require("./test-handle-error");
});

queue.push(function () {
    if (!oldNode) {
        return require("./test-async-function");
    }
});

var res;
setTimeout(() => {
    queue.push(function () {
        if (!oldNode)
            assert.deepEqual(logs, ["AAA", "BBB", "CCC", "DDD", "EEE"]);
        else
            assert.deepEqual(logs, ["AAA", "BBB", "CCC", "DDD"]);

        res = "#### OK ####";
    });
}, 300);

setTimeout(() => {
    assert.equal(res, "#### OK ####");
    console.log(res);
}, 400);