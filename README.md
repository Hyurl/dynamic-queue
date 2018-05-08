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

## Notes

A queue is auto-started when it's instantiated, unless calling `queue.close()`,
otherwise the queue will continue running any task that pushed to internal 
list.

The queue will be automatically closed when no more procedures are going to 
run, you don't have to call `queue.close()` normally.

Be aware of pushing promise tasks, since a promise will run the executor body
before finishing the previous task.

When push an AysncFunction, you can either pass or don't pass the `next` 
argument. If it's passed, you must call it manually. If it's omitted, the next
task will be called when the current one finishes running.