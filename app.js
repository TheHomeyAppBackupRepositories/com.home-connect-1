"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeConnectApp = void 0;
const homey_oauth2app_1 = require("homey-oauth2app");
const homey_1 = require("homey");
const HomeConnectOAuth2Client_1 = __importDefault(require("./lib/HomeConnectOAuth2Client"));
const RateLimiters_1 = __importDefault(require("./lib/RateLimiters"));
const EventStream_1 = __importDefault(require("./lib/EventStream"));
const DEBUG = false;
// const DEBUG = process.env.DEBUG === '1';
// eslint-disable-next-line no-console
if (DEBUG)
    console.log('WARNING: App is communicating with DEVELOPER servers, not PRODUCTION.\nRun app with --install to use PRODUCTION servers.\n');
class HomeConnectApp extends homey_oauth2app_1.OAuth2App {
    constructor() {
        super(...arguments);
        this.eventStream = null;
    }
    async onInit() {
        await super.onInit();
    }
    async onOAuth2Init() {
        const apiUrlSubdomain = (DEBUG) ? 'simulator' : 'api';
        this.createEventStream();
        let scopes = [
            'IdentifyAppliance',
            'Monitor',
            'Control',
            'Settings',
        ];
        // Images are not available in debug mode.
        if (!DEBUG) {
            scopes.push('Images');
        }
        this.log('Scopes: ' + scopes.join(', '));
        if (DEBUG) {
            this.enableOAuth2Debug();
        }
        this.setOAuth2Config({
            client: HomeConnectOAuth2Client_1.default,
            apiUrl: `https://${apiUrlSubdomain}.home-connect.com/api`,
            tokenUrl: `https://${apiUrlSubdomain}.home-connect.com/security/oauth/token`,
            authorizationUrl: `https://${apiUrlSubdomain}.home-connect.com/security/oauth/authorize`,
            scopes: scopes,
            allowMultiSession: false,
            clientId: homey_1.env.CLIENT_ID,
            clientSecret: homey_1.env.CLIENT_SECRET,
            configId: 'default',
            redirectUrl: 'https://callback.athom.com/oauth2/callback',
            token: homey_oauth2app_1.OAuth2Client.TOKEN,
        });
        this.homey.flow.getActionCard('program_stop').registerRunListener(args => {
            return args.device.stopProgram();
        });
        this.homey.flow.getActionCard('open_door').registerRunListener(args => {
            return args.device.openDoor();
        });
        this.log('HomeConnectApp is running...');
    }
    createEventStream() {
        const language = this.homey.__('language');
        this.eventStream = new EventStream_1.default(language, this);
        this.log(`Selected language key: '${language}'`);
        // Note: Connection is created when the first device is initialized.
        //       This is required because each device has its own OAuth2 client
        //       that has to be used.
    }
    getEventStream() {
        return this.eventStream;
    }
    async onUninit() {
        await RateLimiters_1.default.onUninit(this);
    }
}
exports.HomeConnectApp = HomeConnectApp;
module.exports = HomeConnectApp;
