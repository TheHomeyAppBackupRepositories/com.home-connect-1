"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventsource_1 = __importDefault(require("eventsource"));
const events_1 = __importDefault(require("events"));
const RateLimiters_1 = __importDefault(require("./RateLimiters"));
class EventStream extends events_1.default {
    constructor(language, app) {
        super();
        this.language = language;
        this.source = null;
        this.tokenRefreshAttempted = false;
        this.clients = [];
        // Depending on the amount of devices this limit can be exceeded,
        // so we set it to an arbitrarily high number.
        this.setMaxListeners(1000);
        this.rateLimiter = RateLimiters_1.default
            .getLimiter(app, 1 /* LimiterType.Auth */);
    }
    connect() {
        if (this.source) {
            this.getClient().error("Can't connect on an already op event stream.");
            return;
        }
        // Move from CLOSED to CONNECTING
        this.getClient().log(`Moving to CONNECTING connection state`);
        const url = `${this.getClient()._apiUrl}/homeappliances/events`;
        this.source = new eventsource_1.default(url, {
            headers: {
                'Accept-Language': this.language,
                Authorization: `Bearer ${this.getClient()._token.access_token}`,
            },
        });
        this.source.onopen = this.onOpen.bind(this);
        this.source.onerror = this.onError.bind(this);
        this.source.on(EventStream.keepAliveEventType, this.handleKeepAlive.bind(this));
        for (const eventType of EventStream.haEventTypes) {
            this.source.on(eventType, e => {
                try {
                    const data = JSON.parse(e.data);
                    this.emit(`${data['haId']}:${eventType}`, data.items);
                }
                catch (err) {
                    this.getClient().error(`Error when emitting ${eventType}`, err);
                }
            });
        }
    }
    addClient(client) {
        this.clients.push(client);
        if (this.clients.length === 1) {
            // Automatically connect when we get the first client.
            this.connect();
        }
    }
    removeClient(client) {
        if (this.clients.length === 0) {
            return;
        }
        // If the client to be removed is the first client,
        // perform a connect/disconnect cycle to switch over to
        // the new client (& token).
        if (this.clients[0] === client) {
            this.disconnect();
            this.clients.splice(1, 1);
            // Only connect if we have a client.
            if (this.clients.length > 0) {
                this.connect();
            }
        }
        else {
            const index = this.clients.indexOf(client);
            if (index > -1) {
                this.clients.splice(index, 1);
            }
        }
    }
    onOpen(_) {
        this.handleKeepAlive();
        this.getClient().log('Event stream connection opened.');
    }
    handleKeepAlive() {
        if (!this.source) {
            this.getClient().log('Got \'keep-alive\' while in CLOSED state; this should not happen.');
            return;
        }
        if (this.keepAliveTimer) {
            this.getClient().homey.clearTimeout(this.keepAliveTimer);
        }
        this.keepAliveTimer = this.getClient().homey.setTimeout(() => {
            this.getClient().log(`Didn't receive keep-alive event. Reconnecting...`);
            // Go to CLOSED...
            this.disconnect();
            // Then attempt a connection.
            this.connect();
        }, EventStream.keepAliveTimeout);
    }
    onError(event) {
        // Move from CONNECTING to CLOSED
        this.disconnect();
        // Check if this error is recoverable.
        if (event.status === 400 /* HttpStatusCode.BadRequest */ ||
            event.status === 403 /* HttpStatusCode.Forbidden */ ||
            event.status === 406 /* HttpStatusCode.NotAcceptable */) {
            // These errors are not recoverable, abort.
            this.throw(`Could not connect and will not retry because of a fatal error: (${event.status}) ${JSON.stringify(event)}`);
            return;
        }
        if (event.status === 401 /* HttpStatusCode.Unauthorized */) {
            if (this.tokenRefreshAttempted) {
                // Reset state.
                this.tokenRefreshAttempted = false;
                // Not recoverable.
                this.throw(`Could not connect, even after a token refresh: ${JSON.stringify(event)}`);
                return;
            }
            this.getClient().log(`Received a 401 upon connecting, refreshing token...`);
            this.rateLimiter.schedule(() => this.getClient().refreshToken())
                .then(() => this.connect())
                .catch(this.throw.bind(this));
            this.tokenRefreshAttempted = true;
            return;
        }
        // Note: rate limited is now a fatal error.
        if (event.status === 429 /* HttpStatusCode.RateLimited */) {
            this.getClient().log('Rate limited, retrying in 15 minutes.');
            this.getClient().homey
                .setTimeout(() => { this.connect(); }, EventStream.rateLimitTimeout);
            return;
        }
        // Other error, generally recoverable.
        this.getClient().log(`Received HTTP ${event.status}, retrying in 1 minute. Details:`, event);
        this.getClient().homey
            .setTimeout(() => { this.connect(); }, EventStream.refreshTimeout);
    }
    disconnect() {
        // Move from * to CLOSED
        if (this.source) {
            this.getClient().log(`Moving to CLOSED connection state`);
            this.source.close();
            this.source.removeAllListeners();
            this.source = null;
        }
        else {
            this.getClient().log(`Already in CLOSED state`);
        }
        if (this.keepAliveTimer) {
            this.getClient().log('Cleared keepalive timer on disconnect');
            this.getClient().homey.clearTimeout(this.keepAliveTimer);
        }
    }
    throw(message) {
        // No error handler set, throw
        throw new Error(message);
    }
    getClient() {
        if (this.clients.length === 0) {
            // This will probably cause issues if somebody removes all
            // devices while keeping the app...
            throw new Error("No client available");
        }
        return this.clients[0];
    }
}
EventStream.refreshTimeout = 60 * 1000; // 1 minute
EventStream.keepAliveTimeout = 2 * 60 * 1000; // 2 minutes
EventStream.rateLimitTimeout = 15 * 60 * 1000; // 15 minutes
EventStream.haEventTypes = ['STATUS', 'EVENT', 'NOTIFY'];
EventStream.keepAliveEventType = 'KEEP-ALIVE';
exports.default = EventStream;
