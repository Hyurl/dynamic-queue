function isAsyncFunction(fn: Function): boolean {
    return Object.prototype.toString.apply(fn.constructor).slice(8, -1) == "AsyncFunction";
}

export type TaskFunction = (next?: (err?: Error) => void, err?: Error) => void | Promise<void>;

/**
 * Asynchronous Node.js queue with dynamic tasks.
 */
export class Queue {
    /**
     * Whether the queue is running. A queue is auto-started when it's 
     * instantiated, unless you call `stop()`, otherwise this property is 
     * `true`.
     */
    isRunning: boolean = true;
    private tasks: Array<TaskFunction> = [];
    private onNewTask: () => void = null;

    /**
     * Instantiates a new queue.
     * @param task The first task that is about to run. 
     */
    constructor(task?: TaskFunction) {
        task ? this.push(task) : null;
        this.run();

        process.once("beforeExit", (code) => {
            !code ? this.isRunning = true : null;
        });
    }

    /** Pushes a new task to the queue. */
    push(task: TaskFunction): this {
        if (typeof task != "function") {
            throw new TypeError("'task' must be a function");
        } else if (!this.isRunning) {
            throw new Error("pushing task to a stopped queue is not allowed");
        }

        this.tasks.push(task);

        if (this.onNewTask) {
            let fn = this.onNewTask;
            this.onNewTask = null;
            fn();
        }

        return this;
    }

    /** Stops the queue manually. */
    stop(): void {
        this.isRunning = false;
    }

    /** Continues running the queue after it has been stopped or hanged. */
    resume(): void {
        this.isRunning = true;
        this.run();
    }

    /** Runs tasks one by one in series. */
    private run(err: Error = null): void {
        if (!this.isRunning) {
            return;
        } else if (this.tasks.length) {
            let task = this.tasks.shift();

            if (isAsyncFunction(task) && task.length == 0) {
                (<Promise<any>>task()).then(() => this.run(err));
            } else if (task.length) {
                task((_err) => this.run(_err), err);
            } else {
                task();
                this.run(err);
            }
        } else if (!this.onNewTask) {
            this.onNewTask = () => this.run(err);
        }
    }
}

export default Queue;