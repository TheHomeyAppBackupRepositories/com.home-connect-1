"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_oauth2app_1 = require("homey-oauth2app");
const homey_1 = require("homey");
const HomeConnectOAuth2Client_1 = __importDefault(require("./lib/HomeConnectOAuth2Client"));
const SCOPES = [
    'IdentifyAppliance',
    'Monitor',
    'Control',
    // 'Images',
    'Settings',
];
const DEBUG = false;
// const DEBUG = process.env.DEBUG === '1';
// eslint-disable-next-line no-console
if (DEBUG)
    console.log('WARNING: App is communicating with DEVELOPER servers, not PRODUCTION.\nRun app with --install to use PRODUCTION servers.\n');
class HomeConnectApp extends homey_oauth2app_1.OAuth2App {
    async onOAuth2Init() {
        const apiUrlSubdomain = (DEBUG) ? 'simulator' : 'api';
        this.enableOAuth2Debug();
        this.setOAuth2Config({
            client: HomeConnectOAuth2Client_1.default,
            apiUrl: `https://${apiUrlSubdomain}.home-connect.com/api`,
            tokenUrl: `https://${apiUrlSubdomain}.home-connect.com/security/oauth/token`,
            authorizationUrl: `https://${apiUrlSubdomain}.home-connect.com/security/oauth/authorize`,
            scopes: SCOPES,
            allowMultiSession: false,
            clientId: homey_1.env.CLIENT_ID,
            clientSecret: homey_1.env.CLIENT_SECRET,
            configId: 'default',
            redirectUrl: 'https://callback.athom.com/oauth2/callback',
            token: homey_oauth2app_1.OAuth2Client.TOKEN
        });
        this.homey.flow.getActionCard('program_stop').registerRunListener(args => {
            return args.device.stopProgram();
        });
        this.log('HomeConnectApp is running...');
    }
}
module.exports = HomeConnectApp;
