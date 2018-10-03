# DynamicQueue

**A dynamic queue accepts new tasks at any moment and never stops running.**

The API is for **dynamic-queue** 0.2.0+, old versions are deprecated.

## Install

```sh
npm i dynamic-queue --save
```

## Example

```javascript
const { Queue } = require("dynamic-queue");

var outs = [];

// instantiate with a first task using normal function.
var queue = new Queue((next) => {
    outs.push("Hello, World!");
    next();
});

// push a new task.
queue.push((next) => {
    outs.push("Hi, Ayon!");
    next();
});

// push an AsyncFunction.
queue.push(async () => {
    outs.push("Nice to meet you!");
});

queue.push(() => {
    console.log(outs); // => ['Hello, World!', 'Hi, Ayon!', 'Nice to meet you!']
});
```

More examples, please [visit here](./test).

## API

- `new Queue(task?: TaskFunction)`
    - type `TaskFunction` = `(next?: () => void) => void | Promise<void> | Queue`
- `queue.length` Returns the length of waiting tasks.
- `queue.state` The state of queue is either `pending` (by default), `paused` or
    `stopped`.
- `queue.isRunning` Whether the queue is running (`state` is not `stopped`).
- `queue.push(task?: TaskFunction): this` Pushes 
    a new task to the queue.
- `queue.stop()` Stops the queue manually.
- `queue.resume()` Continues running the queue after it has been stopped or 
    hanged.
- `queue.catch(handler: (err: any, resume?: () => void) => void)` Adds an error 
    handler to catch any error occurred during running the task.

## Notes

A queue is auto-started when it's instantiated, unless calling `queue.stop()`,
otherwise the queue will continue running any task that pushed to internal 
list.

The queue will be automatically closed when no more procedures are going to 
run (generally before existing the program), you don't have to call 
`queue.stop()` normally.

When pushing a task, you can either pass or don't pass the `next` argument. If 
it's passed, you must call it manually. If it's omitted, the next task will be 
called when the current one finishes running.

If you passed the `next` argument and yet not calling it, then the queue will 
hang and any left or new task will never run. You must call `queue.resume()` if 
you want the queue to continue running.

## Nested Queues

This package allows you nest queues inside an existing one, similar to `Promise`,
you just need to return a new `Queue` inside one of the task function, and the 
outer-queue will wait until all the remaining tasks in the inner-queue are 
executed before continue running its own tasks. Just like this:

```javascript
var queue = new Queue();

queue.push(() => {
    console.log(1);
});

queue.push(() => {
    var innerQueue = new Queue();
    
    innerQueue.push(() => {
        console.log(2);
    });

    innerQueue.push(() => {
        console.log(3);
    });

    return innerQueue;
});

queue.push(() => {
    console.log(4);
});

// the output sequence would be: 1, 2, 3, 4
```

## Catch Errors

As mentioned above, you can catch any error occurred during the runtime.

```javascript
var queue = new Queue();

queue.catch((err) => {
    console.log(err.stack);
    // `queue.state` is `paused`
    queue.resume(); // continue running tasks
    // `queue.state` will be `pending`
});

queue.push(() => {
    throw new Error("this error will be caught");
});

queue.push(() => {
    console.log("Hello, World!");
});

// The output sequence would be:
// => this error will be caught
// => Hello, World!
```

### Warning

If an inner-queue throws an error and doesn't have a handler to catch it, the 
outer-queue's error handler will be copied into the inner one.

The queue will be paused if any error occurred, you can set an error handler via
`queue.catch()` method, and call `queue.resume()` to continue running tasks, or 
call `queue.stop()` to stop the queue completely.

## Promises

When running asynchronous tasks, you can either pass and call the `next` 
function, or push an `async` function, or any function that returns a `Promise`.
As a matter of fact, in TypeScript or babel, the `async` function will be 
converted to an ordinary function that returns a promise if the target ES 
version doesn't support AsyncFunction.