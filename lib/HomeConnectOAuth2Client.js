"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_oauth2app_1 = require("homey-oauth2app");
const RateLimiters_1 = __importDefault(require("./RateLimiters"));
class HomeConnectOAuth2Client extends homey_oauth2app_1.OAuth2Client {
    async onInit() {
        // The default is 10 and people might have more than 10 devices.
        this.setMaxListeners(1000);
        this._rateLimitedGet = RateLimiters_1.default
            .getLimiter(this.homey.app, 0 /* LimiterType.App */)
            .wrap(this.get.bind(this));
        this.language = this.homey.__('language');
    }
    async onRequestHeaders({ headers }) {
        return {
            ...await super.onRequestHeaders({ headers }),
            Accept: 'application/vnd.bsh.sdk.v1+json, image/jpeg',
            'Content-Type': 'application/vnd.bsh.sdk.v1+json',
            'Accept-Language': this.language,
        };
    }
    async onIsRateLimited({ status, headers }) {
        if (status === 429) {
            const limiter = RateLimiters_1.default.getLimiter(this.homey.app, 0 /* LimiterType.App */);
            const currentReservoir = await limiter.currentReservoir();
            if (currentReservoir) {
                await limiter.incrementReservoir(-currentReservoir);
            }
            const retryAfter = headers.get('retry-after');
            throw new Error(`Rate Limited. Please retry after ${Math.ceil(retryAfter / 60)} minutes.`);
        }
        return false;
    }
    async onHandleResponse({ response }) {
        const { ok, status, statusText } = response;
        if (!ok) {
            if (status !== 500) {
                const { error } = await response.json();
                if (error) {
                    if (error.description && error.description.indexOf('Setting is not supported') > -1) {
                        // "setting not supported" is a sort-of expected response. It shouldn't crash the app
                        // anyways.
                        this.error(error);
                        return undefined;
                    }
                    throw new Error(error.description || error.key || `Unknown Remote Error (${status})`);
                }
            }
            throw new Error(statusText || `Unknown Remote Error (${status})`);
        }
        if (status === 204) {
            return undefined;
        }
        if (response.url.includes('/images/')) {
            if (response.url.includes('stream=true')) {
                return response.body;
            }
            return response.buffer();
        }
        const { data } = await response.json();
        return data;
    }
    async getHomeAppliances() {
        return this._rateLimitedGet({
            path: '/homeappliances',
        });
    }
    async getStatus(haId) {
        return this._rateLimitedGet({
            path: `/homeappliances/${haId}/status`,
        });
    }
    async getAvailablePrograms(haId) {
        const programs = await this._rateLimitedGet({
            path: `/homeappliances/${haId}/programs/available`,
        });
        return programs;
    }
    async getAllPrograms(haId) {
        const programs = await this._rateLimitedGet({
            path: `/homeappliances/${haId}/programs`,
        });
        return programs;
    }
    async getAvailableProgram(haId, key) {
        return this._rateLimitedGet({
            path: `/homeappliances/${haId}/programs/available/${key}`,
        });
    }
    async getSettings(haId) {
        return this._rateLimitedGet({
            path: `/homeappliances/${haId}/settings`,
        });
    }
    async getSetting(haId, key) {
        return this._rateLimitedGet({
            path: `/homeappliances/${haId}/settings/${key}`,
        });
    }
    async getCommands(haId) {
        return this._rateLimitedGet({
            path: `/homeappliances/${haId}/commands`,
        });
    }
    async setSetting(haId, key, value) {
        this.log(`[${haId}] set setting ${key} to ${value}`);
        return this.put({
            path: `/homeappliances/${haId}/settings/${key}`,
            json: {
                data: {
                    key,
                    value,
                },
            },
        });
    }
    async setProgram(haId, programId, options) {
        this.log(`[${haId}] set active program: ${programId}`, options);
        return this.put({
            path: `/homeappliances/${haId}/programs/active`,
            json: {
                data: {
                    options,
                    key: programId,
                },
            },
        });
    }
    async stopProgram(haId) {
        this.log(`[${haId}] stop current program`);
        return this.delete({
            path: `/homeappliances/${haId}/programs/active`,
        });
    }
    async sendCommand(haId, command) {
        this.log(`[${haId}] sending command: ${command}`);
        return this.put({
            path: `/homeappliances/${haId}/commands/${command}`,
            json: {
                data: {
                    key: command,
                    value: true
                }
            }
        });
    }
    async getImages(haId) {
        return this._rateLimitedGet({
            path: `/homeappliances/${haId}/images`,
        }).then(result => result.images);
    }
    async getImage(haId, imageKey, stream) {
        return this._rateLimitedGet({
            path: `/homeappliances/${haId}/images/${imageKey}`,
            query: { stream }
        });
    }
}
exports.default = HomeConnectOAuth2Client;
;
