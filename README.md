# DynamicQueue

**Asynchronous Node.js queue with dynamic tasks.**

## Example

```javascript
const { Queue } = require("dynamic-queue");

var outs = [];

// instantiate with a first task using normal function.
var queue = new Queue((next) => {
    outs.push("Hello, World!");
    next();
});

// push a promise.
queue.push(Promise.resolve("Hi, Ayon!").then(value => {
    outs.push(value);
}));

// push an AsyncFunction.
queue.push(async () => {
    outs.push("Nice to meet you!");
});

// the last task doesn't require calling next.
queue.push(() => {
    console.log(outs); // => ['Hello, World!', 'Hi, Ayon!', 'Nice to meet you!']
});
```