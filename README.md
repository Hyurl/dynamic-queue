# DynamicQueue

**Asynchronous Node.js queue with dynamic tasks.**

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

## API

- `new Queue(task?: TaskFunction)`
    - type `TaskFunction` = `(next?: (err?: Error) => void, err?: Error) => void | Promise<void>`
- `queue.push(task?: TaskFunction): this` Pushes 
    a new task to the queue.
- `queue.stop()` Stops the queue manually.
- `queue.resume()` Continues running the queue after it has been stopped or 
    hanged.

## Pass Error

You can pass an error throw the whole queue by passing the second argument 
`err` to the task function, and transmit an error via `next(err)`, just 
like this:

```javascript
queue.push((next) => {
    try {
        // ...
        next();
    } catch (err) {
        next(err);
    }
});

queue.push((next, err) => {
    if (err)
        return next(err);

    // ...
    next();
});

queue.push((next, err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("All tasks run successfully!");
    }
});
```

## Notes

A queue is auto-started when it's instantiated, unless calling `queue.stop()`,
otherwise the queue will continue running any task that pushed to internal 
list.

The queue will be automatically closed when no more procedures are going to 
run, you don't have to call `queue.stop()` normally.

When push a task, you can either pass or don't pass the `next` argument. If 
it's passed, you must call it manually. If it's omitted, the next
task will be called when the current one finishes running.

If you passed the `next` argument and yet not calling it, then the queue will 
hang and any left or new task will never run. You must call `queue.resume()` 
if you want the queue to continue running.