"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAsyncFunction(fn) {
    return Object.prototype.toString.apply(fn.constructor).slice(8, -1) == "AsyncFunction";
}
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
        task ? this.push(task) : null;
        this.run();
        process.on("beforeExit", function (code) {
            !code ? _this.isRunning = true : null;
        });
    }
    /** Pushes a new task to the queue. */
    Queue.prototype.push = function (task) {
        if (typeof task != "function") {
            throw new TypeError("'task' must be a function");
        }
        else if (!this.isRunning) {
            throw new Error("pushing task to a stopped queue is not allowed");
        }
        this.tasks.push(task);
        if (this.onNewTask) {
            var fn = this.onNewTask;
            this.onNewTask = null;
            fn();
        }
        return this;
    };
    /** Stops the queue manually. */
    Queue.prototype.stop = function () {
        this.isRunning = false;
    };
    /** Continues running the queue after it has been stopped or hanged. */
    Queue.prototype.resume = function () {
        this.isRunning = true;
        this.run();
    };
    /** Recursively runs tasks one by one. */
    Queue.prototype.run = function (err) {
        var _this = this;
        if (err === void 0) { err = null; }
        if (!this.isRunning) {
            return;
        }
        else if (this.tasks.length) {
            var task = this.tasks.shift();
            if (isAsyncFunction(task) && task.length == 0) {
                task().then(function () { return _this.run(err); });
            }
            else if (task.length) {
                task(function (_err) { return _this.run(_err); }, err);
            }
            else {
                task();
                this.run(err);
            }
        }
        else if (!this.onNewTask) {
            this.onNewTask = function () { return _this.run(err); };
        }
    };
    return Queue;
}());
exports.Queue = Queue;
exports.default = Queue;
//# sourceMappingURL=index.js.map