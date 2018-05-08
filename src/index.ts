import { EventEmitter } from "events";

/**
 * Asynchronous Node.js queue with dynamic tasks.
 */
export class Queue extends EventEmitter {
    /**
     * Whether the queue is running. A queue is auto-started when it's 
     * instantiated, unless you call `stop()`, otherwise this property is 
     * `true`.
     */
    isRunning: boolean = true;
    private tasks: Array<(next?: Function) => void | Promise<void>> = [];

    /**
     * Instantiates a new queue.
     * @param task The first task that is about to run. 
     */
    constructor(task?: (next?: Function) => void | Promise<void>) {
        super();
        task ? this.tasks.push(task) : null;
        this.run();

        process.on("beforeExit", (code) => {
            !code ? this.isRunning = true : null;
        });
    }

    /** Pushes a new task to the queue. */
    push(task: (next?: Function) => void | Promise<void>): this {
        this.tasks.push(task);
        this.emit("newTask");
        return this;
    }

    /** Stops the queue. */
    stop(): void {
        this.isRunning = false;
    }

    /** Recursively runs tasks one by one. */
    private run() {
        if (!this.isRunning) {
            return;
        } else if (this.tasks.length) {
            let task = this.tasks.shift();

            if (task instanceof Promise) {
                return task.then(() => this.run());
            } else if (typeof task == "function") {
                if (task.constructor.name == "AsyncFunction") {
                    return (<Promise<any>>task()).then(() => this.run());
                } else {
                    return task(() => this.run());
                }
            } else {
                return this.run();
            }
        } else {
            return this.once("newTask", () => this.run());
        }
    }
}

export default Queue;