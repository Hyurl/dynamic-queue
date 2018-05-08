"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onNewTask = Symbol("onNewTask");
/**
 * Asynchronous Node.js queue with dynamic tasks.
 */
class Queue {
    /**
     * Instantiates a new queue.
     * @param task The first task that is about to run.
     */
    constructor(task) {
        /**
         * Whether the queue is running. A queue is auto-started when it's
         * instantiated, unless you call `stop()`, otherwise this property is
         * `true`.
         */
        this.isRunning = true;
        this.tasks = [];
        task ? this.tasks.push(task) : null;
        this.run();
        process.on("beforeExit", (code) => {
            !code ? this.isRunning = true : null;
        });
    }
    /** Pushes a new task to the queue. */
    push(task) {
        this.tasks.push(task);
        if (this[onNewTask]) {
            let fn = this[onNewTask];
            this[onNewTask] = null;
            fn();
        }
        return this;
    }
    /** Stops the queue. */
    stop() {
        this.isRunning = false;
    }
    /** Recursively runs tasks one by one. */
    run() {
        if (!this.isRunning) {
            return;
        }
        else if (this.tasks.length) {
            let task = this.tasks.shift();
            if (task instanceof Promise) {
                return task.then(() => this.run());
            }
            else if (typeof task == "function") {
                if (task.constructor.name == "AsyncFunction" && task.length == 0) {
                    return task().then(() => this.run());
                }
                else {
                    return task(() => this.run());
                }
            }
            else {
                return this.run();
            }
        }
        else if (!this[onNewTask]) {
            this[onNewTask] = () => this.run();
        }
    }
}
exports.Queue = Queue;
exports.default = Queue;
//# sourceMappingURL=index.js.map