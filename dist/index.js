"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Asynchronous Node.js queue with dynamic tasks.
 */
var Queue = /** @class */ (function () {
    /**
     * Instantiates a new queue.
     * @param task The first task that is about to run.
     */
    function Queue(task) {
        var _this = this;
        /**
         * Whether the queue is running. A queue is auto-started when it's
         * instantiated, unless you call `stop()`, otherwise this property is
         * `true`.
         */
        this.isRunning = true;
        this.tasks = [];
        this.onNewTask = null;
        task ? this.tasks.push(task) : null;
        this.run();
        process.on("beforeExit", function (code) {
            !code ? _this.isRunning = true : null;
        });
    }
    /** Pushes a new task to the queue. */
    Queue.prototype.push = function (task) {
        this.tasks.push(task);
        if (this.onNewTask) {
            var fn = this.onNewTask;
            this.onNewTask = null;
            fn();
        }
        return this;
    };
    /** Stops the queue. */
    Queue.prototype.stop = function () {
        this.isRunning = false;
    };
    /** Recursively runs tasks one by one. */
    Queue.prototype.run = function () {
        var _this = this;
        if (!this.isRunning) {
            return;
        }
        else if (this.tasks.length) {
            var task = this.tasks.shift();
            if (typeof Promise == "function" && task instanceof Promise) {
                return task.then(function () { return _this.run(); });
            }
            else if (typeof task == "function") {
                if (task.constructor.name == "AsyncFunction" && task.length == 0) {
                    return task().then(function () { return _this.run(); });
                }
                else {
                    return task(function () { return _this.run(); });
                }
            }
            else {
                return this.run();
            }
        }
        else if (!this.onNewTask) {
            this.onNewTask = function () { return _this.run(); };
        }
    };
    return Queue;
}());
exports.Queue = Queue;
exports.default = Queue;
//# sourceMappingURL=index.js.map