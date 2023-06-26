"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventsource_1 = __importDefault(require("eventsource"));
const homey_oauth2app_1 = require("homey-oauth2app");
const RECONNECT_EVENTSOURCE_TIMEOUT_FACTOR = 60 * 1000; // one minute
const RECONNECT_BACKOFF_FACTOR = 2;
const MAX_RECONNECT_TIMEOUT = 1000 * 60 * 60 * 48; // 48 hours
const KEEP_ALIVE_TIMEOUT = 120 * 1000; // two minutes
class HomeConnectOAuth2Client extends homey_oauth2app_1.OAuth2Client {
    async onInit() {
        this._eventsource = {};
    }
    async onRequestHeaders({ headers }) {
        return {
            ...await super.onRequestHeaders({ headers }),
            Accept: 'application/vnd.bsh.sdk.v1+json, image/jpeg',
            'Content-Type': 'application/vnd.bsh.sdk.v1+json',
        };
    }
    async onIsRateLimited({ status, headers }) {
        if (status === 429) {
            const retryAfter = headers.get('retry-after');
            throw new Error(`Rate Limited. Please retry after ${Math.ceil(retryAfter / 60)} minutes.`);
        }
        return false;
    }
    async onHandleResponse({ response }) {
        const { ok, status, statusText, } = response;
        if (!ok) {
            if (status !== 500) {
                const { error } = await response.json();
                if (error) {
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
    async enableEvents(haId) {
        if (this._eventsource[haId])
            return;
        if (typeof this._token !== 'object') {
            throw new Error('Missing token');
        }
        await this.handleEvents(haId);
    }
    async handleEvents(haId, reconnectTimeout = RECONNECT_EVENTSOURCE_TIMEOUT_FACTOR, refreshedToken = false) {
        const dataEventTypes = ['status', 'event', 'notify'];
        if (this._eventsource[haId]) {
            this._eventsource[haId].close();
            this._eventsource[haId].removeAllListeners();
            delete this._eventsource[haId];
        }
        this._eventsource[haId] = new eventsource_1.default(`${this._apiUrl}/homeappliances/${haId}/events`, {
            headers: {
                'Accept-Language': 'en-US',
                Authorization: `Bearer ${this._token.access_token}`,
            },
        });
        const es = this._eventsource[haId];
        dataEventTypes.forEach(eventType => {
            es.on(eventType.toUpperCase(), e => {
                try {
                    const data = JSON.parse(e.data);
                    this.emit(`${haId}:${eventType}`, data.items);
                }
                catch (err) {
                    this.error(`Error when emitting ${haId}:${eventType}`, err);
                }
            });
        });
        es.on("connected" /* ConnectionEventType.Connected */.toUpperCase(), e => {
            this.emitSignal(haId, "connected" /* ConnectionEventType.Connected */);
        });
        es.on("disconnected" /* ConnectionEventType.Disconnected */.toUpperCase(), e => {
            this.emitSignal(haId, "disconnected" /* ConnectionEventType.Disconnected */);
        });
        // Handle keep-alive events and try to reconnect if they're
        // not received within a certain time frame.
        es.on("keep-alive" /* ConnectionEventType.KeepAlive */.toUpperCase(), e => {
            this.setKeepAliveTimeout(haId);
        });
        this.setKeepAliveTimeout(haId);
        es.onopen = () => {
            reconnectTimeout = RECONNECT_EVENTSOURCE_TIMEOUT_FACTOR;
            this.emitSignal(haId, "connected" /* ConnectionEventType.Connected */);
        };
        // If there is an error causing the event-stream to close, it is tried to reconnect.
        // This may happen for example when the Home Connect server reboots.
        es.onerror = (err) => {
            this.error('Could not subscribe to live events. Error: ', err);
            this.log(`Trying to reconnect in ${reconnectTimeout} ms`);
            this.emitSignal(haId, "disconnected" /* ConnectionEventType.Disconnected */);
            this._eventsource[haId].close();
            this._eventsource[haId].removeAllListeners();
            delete this._eventsource[haId];
            // Retry to connect. The interval at which it retries is multiplied with factor 2.
            setTimeout(() => {
                if (err.status === 400 // bad request
                    || err.status === 403 // forbidden
                    || err.status === 406 // not acceptable
                    || (err.status === 401 && refreshedToken)) {
                    // With these errors it makes no sense to keep trying
                    this.error(`Could not connect. Please try to add the device again. Error: ${err.status}`);
                }
                else {
                    if (err.status === 401) { // unauthorized
                        this.log('Attempting a token refresh');
                        try {
                            this.refreshToken().then(() => {
                                this.handleEvents(haId, reconnectTimeout, true).catch(error => {
                                    this.error('Reconnecting failure: ', error);
                                });
                            });
                        }
                        catch (e) {
                            this.error(`Could not connect. Please try to add the device again. Error: ${err.status}`, e);
                            // Don't try to reconnect when refreshing fails.
                            return;
                        }
                    }
                    const increaseConnectionTimeout = reconnectTimeout * RECONNECT_BACKOFF_FACTOR;
                    const nextReconnectTimeout = Math.min(increaseConnectionTimeout, MAX_RECONNECT_TIMEOUT);
                    this.handleEvents(haId, nextReconnectTimeout).catch(_ => {
                        this.error('Reconnecting failure: ', err);
                    });
                }
            }, reconnectTimeout);
        };
    }
    setKeepAliveTimeout(haId) {
        if (this._keepAliveTimer) {
            this.homey.clearTimeout(this._keepAliveTimer);
        }
        this._keepAliveTimer = this.homey.setTimeout(() => {
            this.log('Didn\'t receive keep-alive event. Reconnecting...');
            this.handleEvents(haId).catch(this.error.bind(this));
        }, KEEP_ALIVE_TIMEOUT);
    }
    emitSignal(haId, eventType) {
        try {
            this.emit(`${haId}:${eventType}`);
        }
        catch (err) {
            this.error(`Error when emitting ${haId}:${eventType}: `, err);
        }
    }
    async disableEvents(haId) {
        if (typeof this._eventsource[haId] === 'undefined')
            return;
        this._eventsource[haId].close();
        this._eventsource[haId].removeAllListeners();
        delete this._eventsource[haId];
    }
    async getHomeAppliances() {
        return this.get({
            path: '/homeappliances',
        });
    }
    async getStatus(haId) {
        return this.get({
            path: `/homeappliances/${haId}/status`,
        });
    }
    async getAvailablePrograms(haId) {
        const programs = await this.get({
            path: `/homeappliances/${haId}/programs/available`,
        });
        return programs;
    }
    // async getAvailableProgram(haId: ApplianceId, key: string) {
    //     return this.get({
    //         path: `/homeappliances/${haId}/programs/available/${key}`,
    //     });
    // }
    async getSettings(haId) {
        return this.get({
            path: `/homeappliances/${haId}/settings`,
        });
    }
    async getSetting(haId, key) {
        return this.get({
            path: `/homeappliances/${haId}/settings/${key}`,
        });
    }
    async setSetting(haId, key, value) {
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
        return this.delete({
            path: `/homeappliances/${haId}/programs/active`,
        });
    }
    async getImages(haId) {
        return this.get({
            path: `/homeappliances/${haId}/images`,
        }).then(result => result.images);
    }
    async getImage(haId, imageKey, stream) {
        return this.get({
            path: `/homeappliances/${haId}/images/${imageKey}`,
            query: { stream }
        });
    }
}
exports.default = HomeConnectOAuth2Client;
;
