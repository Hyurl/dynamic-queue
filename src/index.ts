export type TaskFunction = (next?: () => void) => void | Promise<void> | Queue;

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
    private onError: (err: any, resume: () => void) => void;

    /**
     * Instantiates a new queue.
     * @param task The first task that is about to run. 
     */
    constructor(task?: TaskFunction) {
        task ? this.push(task) : null;

        setImmediate(() => {
            this.run();
        });

        process.once("beforeExit", (code) => {
            !code ? this.isRunning = true : null;
        });
    }

    /** Returns the waiting tasks' length. */
    get length() {
        return this.tasks.length;
    }

    /** Pushes a new task to the queue. */
    push(task: TaskFunction): this {
        if (typeof task != "function") {
            throw new TypeError("task must be a function");
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

    /**
     * Adds an error handler to catch any error occurred during running the task.
     */
    catch(handler: (err: any, resume?: () => void) => void) {
        this.onError = handler;
    }

    /** Runs tasks one by one in series. */
    private run(): void {
        if (!this.isRunning) {
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
        this.stop();
        if (this.onError) {
            this.onError(err, () => this.resume());
        } else {
            throw err;
        }
    }
}

export default Queue;