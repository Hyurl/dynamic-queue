const { Queue } = require("../");
const assert = require("assert");

var outs = [];

var queue = new Queue();

queue.push(async () => {
    outs.push("Hello, World!");
}).push(async () => {
    outs.push("Hi, Ayon!");
}).push(() => {
    assert.deepEqual(outs, ["Hello, World!", "Hi, Ayon!"]);
});