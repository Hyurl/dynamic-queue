export type TaskFunction = (next?: () => void) => void | Promise<void> | Queue;

/**
 * Asynchronous Node.js queue with dynamic tasks.
 */
export class Queue {
    state: "pending" | "paused" | "stopped" = "pending";
    private tasks: Array<TaskFunction> = [];
    private onNewTask: () => void = null;
    private onError: (err: any) => void;

    /**
     * Instantiates a new queue.
     * @param task The first task that is about to run. 
     */
    constructor(task?: TaskFunction) {
        task && this.push(task);
        setImmediate(() => this.run());
    }

    /** Returns the length of waiting tasks. */
    get length() {
        return this.tasks.length;
    }

    /**
     * Whether the queue is running. A queue is auto-started when it's 
     * instantiated, unless you call `stop()`, otherwise this property is 
     * `true`.
     */
    get isRunning() {
        return this.state != "stopped";
    }

    /** Pushes a new task to the queue. */
    push(task: TaskFunction): this {
        if (typeof task != "function") {
            throw new TypeError("task must be a function");
        } else if (this.state == "stopped") {
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
        this.state = "stopped";
    }

    /** Continues running the queue after it has been stopped or hanged/paused. */
    resume(): void {
        this.state = "pending";
        this.run();
    }

    /**
     * Adds an error handler to catch any error occurred during running the task.
     */
    catch(handler: (err: any) => void) {
        this.onError = handler;
    }

    /** Runs tasks one by one in series. */
    private run(): void {
        if (this.state == "paused" || this.state == "stopped") {
            return;
        } else if (this.tasks.length) {
            let task = this.tasks.shift();

            if (task.length) {
                try {
                    task(() => this.run());
                } catch (err) {
                    this.handleError(err);
                }
            } else {
                let res;
                try {
                    res = task();
                } catch (err) {
                    this.handleError(err);
                }

                if (res) {
                    if (res instanceof Queue) {
                        if (!res.onError) res.onError = this.onError;
                        res.push((next) => {
                            this.push(() => next()).run();
                        });
                    } else if (typeof res.then == "function") {
                        res.then(() => this.run()).catch(err => {
                            this.handleError(err);
                        });
                    }
                } else {
                    this.run();
                }
            }
        } else if (!this.onNewTask) {
            this.onNewTask = () => this.run();
        }
    }

    private handleError(err?: any) {
        this.state = "paused";
        if (this.onError) {
            this.onError(err);
        } else {
            throw err;
        }
    }
}

export default Queue;