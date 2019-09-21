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
        this.state = "pending";
        this.tasks = [];
        this.onNewTask = null;
        task && this.push(task);
        setImmediate(function () { return _this.run(); });
    }
    Object.defineProperty(Queue.prototype, "length", {
        /** Returns the length of waiting tasks. */
        get: function () {
            return this.tasks.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Queue.prototype, "isRunning", {
        /**
         * Whether the queue is running. A queue is auto-started when it's
         * instantiated, unless you call `stop()`, otherwise this property is
         * `true`.
         */
        get: function () {
            return this.state != "stopped";
        },
        enumerable: true,
        configurable: true
    });
    /** Pushes a new task to the queue. */
    Queue.prototype.push = function (task) {
        if (typeof task != "function") {
            throw new TypeError("task must be a function");
        }
        else if (this.state == "stopped") {
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
        this.state = "stopped";
    };
    /** Continues running the queue after it has been stopped or hanged/paused. */
    Queue.prototype.resume = function () {
        this.state = "pending";
        this.run();
    };
    /**
     * Adds an error handler to catch any error occurred during running the task.
     */
    Queue.prototype.catch = function (handler) {
        this.onError = handler;
    };
    /** Runs tasks one by one in series. */
    Queue.prototype.run = function () {
        var _this = this;
        if (this.state == "paused" || this.state == "stopped") {
            return;
        }
        else if (this.tasks.length) {
            var task = this.tasks.shift();
            if (task.length) {
                try {
                    task(function () { return _this.run(); });
                }
                catch (err) {
                    this.handleError(err);
                }
            }
            else {
                var res = void 0;
                try {
                    res = task();
                }
                catch (err) {
                    this.handleError(err);
                }
                if (res) {
                    if (res instanceof Queue) {
                        if (!res.onError)
                            res.onError = this.onError;
                        res.push(function (next) {
                            _this.push(function () { return next(); }).run();
                        });
                    }
                    else if (typeof res.then == "function") {
                        res.then(function () { return _this.run(); }).catch(function (err) {
                            _this.handleError(err);
                        });
                    }
                }
                else {
                    this.run();
                }
            }
        }
        else if (!this.onNewTask) {
            this.onNewTask = function () { return _this.run(); };
        }
    };
    Queue.prototype.handleError = function (err) {
        this.state = "paused";
        if (this.onError) {
            this.onError(err);
        }
        else {
            throw err;
        }
    };
    return Queue;
}());
exports.Queue = Queue;
exports.default = Queue;
//# sourceMappingURL=index.js.map