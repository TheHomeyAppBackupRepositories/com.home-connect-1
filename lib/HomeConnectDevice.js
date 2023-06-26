"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_oauth2app_1 = require("homey-oauth2app");
const Util_1 = __importDefault(require("./Util"));
const DEBUG = process.env.DEBUG === '1';
class HomeConnectDevice extends homey_oauth2app_1.OAuth2Device {
    constructor() {
        super(...arguments);
        this._queuedColor = null;
    }
    onOAuth2Migrate() {
        const store = this.getStore();
        if (store.token) {
            const token = new homey_oauth2app_1.OAuth2Token(store.token);
            const sessionId = homey_oauth2app_1.OAuth2Util.getRandomId();
            const configId = this.driver.getOAuth2ConfigId();
            return {
                sessionId,
                configId,
                token,
            };
        }
        if (DEBUG)
            this.log('No token found');
        return undefined;
    }
    onOAuth2MigrateSuccess() {
        this.unsetStoreValue('token');
    }
    async onOAuth2Init() {
        const { haId } = this.getData();
        this.haId = haId;
        this.oAuth2Client.on(`${haId}:status`, this._onStatus.bind(this));
        this.oAuth2Client.on(`${haId}:notify`, this._onNotify.bind(this));
        this.oAuth2Client.on(`${haId}:event`, this._onEvent.bind(this));
        this.oAuth2Client.on(`${haId}:connected`, this._onConnect.bind(this));
        this.oAuth2Client.on(`${haId}:disconnected`, this._onDisconnect.bind(this));
        this.log('onInit', haId);
        // TODo: is _onConnect always called?
        // For the initial start we do a sync
        // If the request fails then the device he device is regarded as unavailable.
        // await this.sync()
        //     .catch(err => {
        //         this.setUnavailable();
        //         this.error(err);
        //     });
        await this.oAuth2Client.enableEvents(haId)
            .then(() => {
            this.log('Subscribed to live events');
        })
            .catch(this.error);
        this.handleOnOff();
        this.handleAmbientLighting();
    }
    handleOnOff() {
        if (this.hasCapability('onoff')) {
            this.registerCapabilityListener('onoff', (value) => {
                if (value) {
                    if (this.supportsOnPowerState()) {
                        return this._setSetting('BSH.Common.Setting.PowerState', 'BSH.Common.EnumType.PowerState.On');
                    }
                    else {
                        this.log('Device does not support turning on.');
                    }
                }
                else {
                    if (this.supportsOffPowerState()) {
                        return this._setSetting('BSH.Common.Setting.PowerState', 'BSH.Common.EnumType.PowerState.Off');
                    }
                    else if (this.supportsStandbyPowerState()) {
                        return this._setSetting('BSH.Common.Setting.PowerState', 'BSH.Common.EnumType.PowerState.Standby');
                    }
                    else {
                        this.log('Device does not support turning off or putting into standby.');
                    }
                }
            });
        }
    }
    handleAmbientLighting() {
        if (this.hasCapability('light_hue')) {
            // Implies light_saturation
            this.registerHueCapabilityListener();
        }
    }
    registerHueCapabilityListener() {
        this.registerCapabilityListener('light_hue', async (value) => {
            this.queueColorChange();
        });
        this.registerCapabilityListener('light_saturation', async (value) => {
            this.queueColorChange();
        });
    }
    supportsOnPowerState() {
        // Right now, all devices support being turned on.
        // Can still be overwritten by child devices.
        return true;
    }
    async onOAuth2Deleted() {
        await this.oAuth2Client.disableEvents(this.haId);
    }
    async syncStatus() {
        this.log('Getting status...');
        const statusResponse = await this.oAuth2Client.getStatus(this.haId);
        if (!statusResponse || !Array.isArray(statusResponse.status)) {
            this.error(statusResponse);
            throw new Error('Invalid status response');
        }
        for (const statusObj of statusResponse.status) {
            await this._parseGlobalStatus(statusObj.key, statusObj.value, false);
        }
    }
    async syncSettings() {
        this.log('Getting settings...');
        const settingsResponse = await this.oAuth2Client.getSettings(this.haId);
        if (!Array.isArray(settingsResponse.settings)) {
            this.error(settingsResponse);
            throw new Error('Invalid settings response');
        }
        for (const settingObj of settingsResponse.settings) {
            await this._parseGlobalSetting(settingObj.key, settingObj.value);
        }
    }
    async sync() {
        this.log("Starting sync...");
        try {
            try {
                await this.syncSettings();
                this.log('Synced settings');
            }
            catch (e) {
                this.error("Sync settings failed", e);
            }
            try {
                await this.syncStatus();
                this.log('Synced status');
            }
            catch (e) {
                this.error("Sync status failed", e);
            }
            await this.onSync();
            await this.setAvailable();
            this.log("Sync completed");
        }
        catch (e) {
            this.error("Sync failed", e);
        }
    }
    onSync() {
        return Promise.resolve();
    }
    async _parseGlobalStatus(key, value, event) {
        if (DEBUG)
            this.log('_parseGlobalStatus', key, value, event);
        // Door events
        if (event && key === 'BSH.Common.Status.DoorState' && value === 'BSH.Common.EnumType.DoorState.Open') {
            this.homey.flow.getDeviceTriggerCard('door_opened')
                .trigger(this)
                .catch(this.error);
        }
        if (event && key === 'BSH.Common.Status.DoorState' && value === 'BSH.Common.EnumType.DoorState.Closed') {
            this.homey.flow.getDeviceTriggerCard('door_closed')
                .trigger(this)
                .catch(this.error);
        }
        // Light events
        if (key === "BSH.Common.Setting.AmbientLightEnabled") {
            this.log('Detected ambient light capability on device');
            if (!this.hasCapability('light_hue')) {
                await this.addCapability('light_hue');
                await this.addCapability('light_saturation');
                this.registerHueCapabilityListener();
            }
        }
        if (key === "BSH.Common.Setting.AmbientLightCustomColor" && this.hasCapability('light_hue')) {
            this.log('Detected ambient light color setting on device');
            const rgb = Util_1.default.hex2rgb(value);
            const hsl = Util_1.default.rgb2hsl(...rgb);
            this.log(`Received ambient color value ${value} (rgb: ${rgb}, hsl: ${hsl})`);
            await this.setCapabilityValue('light_hue', hsl[0]).catch(this.error);
            await this.setCapabilityValue('light_saturation', hsl[1]).catch(this.error);
        }
        await this.checkOperationState(key, value);
        return this._parseStatus(key, value);
    }
    queueColorChange() {
        // Don't queue more than once.
        if (this._queuedColor) {
            return;
        }
        // Homey keeps Hue and Saturation in separate capabilities, but the device expects a single color value
        // in HEX-format. To prevent weird color changes, we wait a bit before sending the color to the device to receive both values.
        this._queuedColor = this.driver.homey.setTimeout(async () => {
            try {
                const hue = await this.getCapabilityValue('light_hue') * 360;
                const saturation = await this.getCapabilityValue('light_saturation');
                const rgb = Util_1.default.hsl2rgb(hue, saturation, 0.5);
                this.log(`Hue: ${hue}, saturation: ${saturation}, rgb: ${rgb}`);
                const hex = Util_1.default.rgb2hex(...rgb);
                await this.oAuth2Client.setSetting(this.haId, 'BSH.Common.Setting.AmbientLightCustomColor', hex);
            }
            finally {
                this._queuedColor = null;
            }
        }, 200);
    }
    // TODO: make key more specific
    async checkOperationState(key, value) {
        if (key === 'BSH.Common.Status.OperationState') {
            if (this.hasCapability('onoff')) {
                this.setCapabilityValue('onoff', value !== 'BSH.Common.EnumType.OperationState.Inactive')
                    .catch(this.error);
            }
            if (value === 'BSH.Common.EnumType.OperationState.Run') {
                this.homey.flow.getDeviceTriggerCard('program_started')
                    .trigger(this)
                    .catch(this.error);
                // The server does not always immediately give progress values.
                // Therefore we set the values to show the user that something is going on.
                if (this.hasCapability('bshc_string.progress')) {
                    this.setCapabilityValue('bshc_string.progress', '0%')
                        .catch(this.error);
                }
                if (this.hasCapability('bshc_string.remaining_time')) {
                    this.setCapabilityValue('bshc_string.remaining_time', 'Loading...')
                        .catch(this.error);
                }
            }
            if (value === 'BSH.Common.EnumType.OperationState.Finished') {
                this.homey.flow.getDeviceTriggerCard('program_finished')
                    .trigger(this)
                    .catch(this.error);
                // Reset the program progress and program time
                if (this.hasCapability('bshc_string.progress')) {
                    this.setCapabilityValue('bshc_string.progress', null)
                        .catch(this.error);
                }
                if (this.hasCapability('bshc_string.remaining_time')) {
                    this.setCapabilityValue('bshc_string.remaining_time', null)
                        .catch(this.error);
                }
            }
        }
    }
    async _parseGlobalSetting(key, value) {
        if (DEBUG)
            this.log('_parseGlobalSetting', key, value);
        if (key === 'BSH.Common.Setting.PowerState') {
            if (this.hasCapability('onoff')) {
                this.setCapabilityValue('onoff', value === 'BSH.Common.EnumType.PowerState.On')
                    .catch(this.error);
            }
            if (this.hasCapability('bshc_onoff')) {
                this.setCapabilityValue('bshc_onoff', value === 'BSH.Common.EnumType.PowerState.On')
                    .catch(this.error);
            }
        }
        return this._parseSetting(key, value);
    }
    async _parseGlobalEvent(key, value) {
        if (DEBUG)
            this.log('_parseGlobalEvent', key, value);
        return this._parseEvent(key, value);
    }
    async _parseGlobalNotify(key, value) {
        if (DEBUG)
            this.log('_parseGlobalNotify', key, value);
        if (key === 'BSH.Common.Option.ProgramProgress') {
            if (this.hasCapability('bshc_string.progress')) {
                this.setCapabilityValue('bshc_string.progress', `${value}%`)
                    .catch(this.error);
            }
        }
        if (key === 'BSH.Common.Option.RemainingProgramTime') {
            if (this.hasCapability('bshc_string.remaining_time')) {
                this.setCapabilityValue('bshc_string.remaining_time', Util_1.default.formatSecondsToMSS(value))
                    .catch(this.error);
            }
        }
        if (key === 'BSH.Common.Setting.PowerState') {
            if (this.hasCapability('onoff')) {
                this.setCapabilityValue('onoff', value === 'BSH.Common.EnumType.PowerState.On')
                    .catch(this.error);
            }
        }
        await this.checkOperationState(key, value);
        return this._parseNotify(key, value);
    }
    async _parseStatus(key, value) {
        // extend me
    }
    async _parseSetting(key, value) {
        // extend me
    }
    async _parseEvent(key, value) {
        // extend me
    }
    async _parseNotify(key, value) {
        // extend me
    }
    async _setSetting(key, value) {
        return this.oAuth2Client.setSetting(this.haId, key, value);
    }
    async _setProgram(programId, options) {
        // Devices with an onoff capability may have been turned off.
        // This ensures that they are turned on
        if (this.hasCapability('onoff')) {
            await this._setSetting('BSH.Common.Setting.PowerState', 'BSH.Common.EnumType.PowerState.On');
        }
        return this.oAuth2Client.setProgram(this.haId, programId, options);
    }
    async stopProgram() {
        return this.oAuth2Client.stopProgram(this.haId);
    }
    _onStatus(items) {
        this.log("Status changed: ", items);
        if (Array.isArray(items)) {
            items.forEach(item => {
                this._parseGlobalStatus(item.key, item.value, true)
                    .catch(this.error);
            });
        }
    }
    _onNotify(items) {
        if (Array.isArray(items)) {
            items.forEach(item => {
                this._parseGlobalNotify(item.key, item.value)
                    .catch(this.error);
            });
        }
    }
    _onEvent(items) {
        if (Array.isArray(items)) {
            items.forEach(item => {
                this._parseGlobalEvent(item.key, item.value)
                    .catch(this.error);
            });
        }
    }
    // Function that compares all possible programs with the programs that
    // are supported by the device according to the API
    // It populates the Flow card with the available programs in the user's desired language.
    async setProgramAutoComplete(flowcard, allPrograms) {
        const availablePrograms = await this.oAuth2Client
            .getAvailablePrograms(this.getData().haId);
        flowcard.getArgument('program')
            .registerAutocompleteListener(async (query, _) => {
            return allPrograms
                .filter(program => {
                return availablePrograms.programs && availablePrograms.programs
                    .find(availableProgram => availableProgram.key === program);
            })
                // Return an object with the name and description in the user's preferred language
                .map(key => {
                const descriptionKey = `${key}.description`;
                const translationResult = this.homey.__(descriptionKey);
                return {
                    key,
                    // Set the description if we could find a translation for it
                    description: (translationResult !== descriptionKey) ? translationResult : '',
                    name: this.homey.__(`${key}.name`),
                };
            })
                // Filter for the search results
                .filter(item => {
                return item.name.toLowerCase()
                    .includes(query.toLowerCase());
            });
        });
    }
    _onConnect() {
        if (DEBUG)
            this.log('Device connected');
        this.setAvailable()
            .catch(this.error);
        // the state of the device may have changed, so we resync the Status and Settings
        this.sync().catch(this.error);
    }
    _onDisconnect() {
        this.log('Device disconnected');
        this.setUnavailable()
            .catch(this.error);
    }
}
exports.default = HomeConnectDevice;
;
