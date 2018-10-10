var Queue = require("../").default;
var assert = require("assert");
var logs = require("./logs");

var outs = [];

var queue = new Queue();

queue.push(function () {
    return Promise.resolve(outs.push("Hello, World!"));
}).push(function () {
    return Promise.resolve(outs.push("Hi, Ayon!"));
}).push(function () {
    assert.deepEqual(outs, ["Hello, World!", "Hi, Ayon!"]);
    logs.push("BBB");
});

module.exports = queue;