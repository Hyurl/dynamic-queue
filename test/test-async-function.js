const { Queue } = require("../");
const assert = require("assert");
var logs = require("./logs");

var outs = [];

var queue = new Queue();

queue.push(async () => {
    outs.push("Hello, World!");
}).push(async () => {
    outs.push("Hi, Ayon!");
}).push(() => {
    logs.push("EEE");
    assert.deepEqual(outs, ["Hello, World!", "Hi, Ayon!"]);
});

module.exports = queue;