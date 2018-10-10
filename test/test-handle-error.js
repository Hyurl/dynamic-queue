var Queue = require("../").default;
var assert = require("assert");
var logs = require("./logs");

var outs = [];

var queue = new Queue();

queue.push(function () {
    outs.push("Hello, World!");
}).push(function () {
    throw new Error("This error will cause the queue to pause.");
}).push(function () {
    assert.deepEqual(outs, ["Hello, World!"]);
    logs.push("DDD");
}).catch(function (err) {
    assert.equal(err.message, "This error will cause the queue to pause.");
    logs.push("CCC");
    queue.resume();
});

module.exports = queue;