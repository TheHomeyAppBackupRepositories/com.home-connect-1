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
    getLimiter(app) {
        if (!this.limiters.has(app)) {
            const bottleneck = new bottleneck_1.default({
                // There is a limit of 50 requests per client and home connect account per minute.
                reservoir: 50,
                reservoirRefreshAmount: 50,
                reservoirRefreshInterval: 60 * 1000,
                // Be safe and only allow 1 request at a time.
                maxConcurrent: 1,
                // Allow 10 requests per second. While the API allows bursts 20, we want to be safe.
                minTime: 250,
            });
            bottleneck.on("depleted", empty => {
                console.log('Bottleneck depleted', empty);
            });
            this.limiters.set(app, bottleneck);
        }
        return this.limiters.get(app);
    }
    async onUninit(app) {
        if (this.limiters.has(app)) {
            await this.limiters.get(app).stop();
            this.limiters.delete(app);
        }
    }
}
exports.default = new RateLimiters();
