"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bottleneck_1 = __importDefault(require("bottleneck"));
class RateLimiters {
    constructor() {
        this.limiters = new Map();
    }
    getLimiter(app, type) {
        if (!this.limiters.has(app)) {
            const appLimiter = new bottleneck_1.default({
                // There is a limit of 50 requests per client and home connect account per minute.
                // reservoir: 50,
                // reservoirRefreshAmount: 50,
                // reservoirRefreshInterval: 60 * 1000,
                // Be safe and only allow 1 request at a time.
                maxConcurrent: 1,
                // Allow ~4 requests per second. While the API allows bursts 20, we want to be safe.
                minTime: 300,
            });
            appLimiter.on("depleted", empty => {
                console.log('App bottleneck depleted', empty);
            });
            const concurrencyAuthLimiter = new bottleneck_1.default({
                // 1 per second
                minTime: 2000,
                // Be safe and only allow 1 request at a time
                maxConcurrent: 1
            });
            this.limiters.set(app, {
                [0 /* LimiterType.App */]: appLimiter,
                [1 /* LimiterType.Auth */]: concurrencyAuthLimiter
            });
        }
        return this.limiters.get(app)[type];
    }
    async onUninit(app) {
        if (this.limiters.has(app)) {
            const limiters = this.limiters.get(app);
            await limiters[0 /* LimiterType.App */].stop();
            await limiters[1 /* LimiterType.Auth */].stop();
            this.limiters.delete(app);
        }
    }
}
exports.default = new RateLimiters();
