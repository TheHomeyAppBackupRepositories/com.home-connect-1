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
        this.availableCommands = [];
        this.handlers = {
            'BSH.Common.Setting.PowerState': async (value) => {
                if (this.hasCapability('onoff')) {
                    this.setCapabilityValue('onoff', value === 'BSH.Common.EnumType.PowerState.On')
                        .catch(this.error);
                }
                if (this.hasCapability('bshc_onoff')) {
                    const isOn = value === 'BSH.Common.EnumType.PowerState.On';
                    this.setCapabilityValue('bshc_onoff', isOn)
                        .catch(this.error);
                    if (isOn) {
                        await this.homey.flow.getDeviceTriggerCard('bshc_onoff_true')
                            .trigger(this);
                    }
                    else {
                        await this.homey.flow.getDeviceTriggerCard('bshc_onoff_false')
                            .trigger(this);
                    }
                }
            },
            'BSH.Common.Status.DoorState': async (value) => {
                if (value === 'BSH.Common.EnumType.DoorState.Closed') {
                    await this.homey.flow.getDeviceTriggerCard('door_closed')
                        .trigger(this);
                }
                else if (value === 'BSH.Common.EnumType.DoorState.Open') {
                    await this.homey.flow.getDeviceTriggerCard('door_opened')
                        .trigger(this);
                }
                // Cooling devices have separate alarm triggers for the door.
                if (!['fridge', 'freezer', 'refrigerator'].includes(this.driver.id)) {
                    await this.handleDoorAlarm(value);
                }
            },
            'BSH.Common.Status.RemoteControlActive': async (value) => {
                if (!this.hasCapability('remote_control_active')) {
                    await this.addCapability('remote_control_active');
                    this.handleRemoteControl();
                }
                await this.setCapabilityValue('remote_control_active', value);
                if (value) {
                    await this.homey.flow.getDeviceTriggerCard('remote_control_active_true')
                        .trigger(this);
                }
                else {
                    await this.homey.flow.getDeviceTriggerCard('remote_control_active_false')
                        .trigger(this);
                }
            },
            'BSH.Common.Status.RemoteControlStartAllowed': async (value) => {
                if (!this.hasCapability('remote_control_start_allowed')) {
                    await this.addCapability('remote_control_start_allowed');
                    this.handleRemoteStart();
                }
                await this.setCapabilityValue('remote_control_start_allowed', value);
                if (value) {
                    await this.homey.flow.getDeviceTriggerCard('remote_control_start_allowed_true')
                        .trigger(this);
                }
                else {
                    await this.homey.flow.getDeviceTriggerCard('remote_control_start_allowed_false')
                        .trigger(this);
                }
            },
            'Refrigeration.FridgeFreezer.Event.DoorAlarmRefrigerator': this.handleDoorAlarm.bind(this),
            'Refrigeration.FridgeFreezer.Event.DoorAlarmFreezer': this.handleDoorAlarm.bind(this),
            'BSH.Common.Setting.AmbientLightEnabled': async (value) => {
                this.log('Detected ambient light capability on device');
                if (!this.hasCapability('light_hue')) {
                    await this.addCapability('light_hue');
                    await this.addCapability('light_saturation');
                    this.registerHueCapabilityListener();
                }
            },
            'BSH.Common.Setting.AmbientLightCustomColor': async (value) => {
                if (!this.hasCapability('light_hue')) {
                    return;
                }
                this.log('Detected ambient light color setting on device');
                const rgb = Util_1.default.hex2rgb(value);
                const hsl = Util_1.default.rgb2hsl(...rgb);
                this.log(`Received ambient color value ${value} (rgb: ${rgb}, hsl: ${hsl})`);
                await this.setCapabilityValue('light_hue', hsl[0]).catch(this.error);
                await this.setCapabilityValue('light_saturation', hsl[1]).catch(this.error);
            },
            'BSH.Common.Status.OperationState': async (value) => {
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
            },
            'BSH.Common.Option.ProgramProgress': async (value) => {
                if (this.hasCapability('bshc_string.progress')) {
                    this.setCapabilityValue('bshc_string.progress', `${value}%`)
                        .catch(this.error);
                }
            },
            'BSH.Common.Option.RemainingProgramTime': async (value) => {
                if (this.hasCapability('bshc_string.remaining_time')) {
                    this.setCapabilityValue('bshc_string.remaining_time', Util_1.default.formatSecondsToMSS(value))
                        .catch(this.error);
                }
            },
        };
        this._queuedColor = null;
    }
    listenFor(key, handler) {
        if (this.handlers.hasOwnProperty(key)) {
            if (Array.isArray(this.handlers[key])) {
                this.handlers[key].push(handler);
            }
            else {
                this.handlers[key] = [this.handlers[key], handler];
            }
        }
        else {
            this.handlers[key] = handler;
        }
    }
    async onSettings({ oldSettings, newSettings, changedKeys }) {
        if (changedKeys.includes("activateZone" /* Settings.ActivateZone */)) {
            if (this.hasCapability('alarm_contact')) {
                this.log('alarm_contact zone activity trigger capability is enabled/disabled', newSettings["activateZone" /* Settings.ActivateZone */]);
                await this.setCapabilityOptions('alarm_contact', {
                    zoneActivity: newSettings["activateZone" /* Settings.ActivateZone */],
                });
            }
            else {
                this.log('alarm_contact capability is not present, skipping zone activity settings');
            }
        }
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
        const app = this.homey.app;
        const eventStream = app.getEventStream();
        eventStream.addClient(this.oAuth2Client);
        eventStream.on(`${haId}:STATUS`, this.handleEvent.bind(this));
        eventStream.on(`${haId}:NOTIFY`, this.handleEvent.bind(this));
        eventStream.on(`${haId}:EVENT`, this.handleEvent.bind(this));
        this.log('onInit', haId);
        this.handleOnOff();
        this.handleRemoteControl();
        this.handleRemoteStart();
        this.handleAmbientLighting();
        // the state of the device may have changed, so we resync the Status and Settings
        this.sync().then(success => {
            if (!success) {
                this.log('Was not able to sync settings, retrying once in 3 minutes');
                // If the initial sync was not successful, try
                // again one more time after 3 minutes.
                this.homey.setTimeout(() => {
                    this.sync().catch(this.error.bind(this));
                }, 1000 * 60 * 3 /* 3 minutes */);
            }
        }).catch(this.error.bind(this));
    }
    async onOAuth2Deleted() {
        this.homey.app
            .getEventStream()
            .removeClient(this.oAuth2Client);
    }
    handleOnOff() {
        if (this.hasCapability('bshc_onoff')) {
            // bshc_onoff is a read-only onoff, only handle the conditional flow here.
            this.homey.flow.getConditionCard('bshc_onoff')
                .registerRunListener(async (args, state) => {
                return args.device.getCapabilityValue('bshc_onoff');
            });
        }
        else if (this.hasCapability('onoff')) {
            this.registerCapabilityListener('onoff', this.onOffListener.bind(this));
        }
    }
    handleRemoteControl() {
        if (this.hasCapability('remote_control_active')) {
            this.homey.flow.getConditionCard('remote_control_active')
                .registerRunListener(async (args, state) => {
                return args.device.getCapabilityValue('remote_control_active');
            });
        }
    }
    handleRemoteStart() {
        if (this.hasCapability('remote_control_start_allowed')) {
            this.homey.flow.getConditionCard('remote_control_start_allowed')
                .registerRunListener(async (args, state) => {
                return args.device.getCapabilityValue('remote_control_start_allowed');
            });
        }
    }
    onOffListener(value) {
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
    }
    handleAmbientLighting() {
        if (this.hasCapability('light_hue')) {
            // Implies light_saturation
            this.registerHueCapabilityListener();
        }
    }
    registerHueCapabilityListener() {
        this.registerMultipleCapabilityListener(['light_hue', 'light_saturation'], async (values) => {
            this.log(values);
            this.queueColorChange();
        });
    }
    supportsOnPowerState() {
        // Right now, all devices support being turned on.
        // Can still be overwritten by child devices.
        return true;
    }
    async syncStatus() {
        this.log('Getting status...');
        const statusResponse = await this.oAuth2Client.getStatus(this.haId);
        if (!statusResponse || !Array.isArray(statusResponse.status)) {
            this.error(statusResponse);
            throw new Error('Invalid status response');
        }
        for (const statusObj of statusResponse.status) {
            await this.callHandler(statusObj.key, statusObj.value);
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
            await this.callHandler(settingObj.key, settingObj.value);
        }
    }
    async syncCommands() {
        this.log('Getting commands...');
        const commandsResponse = await this.oAuth2Client.getCommands(this.haId);
        if (!Array.isArray(commandsResponse.commands)) {
            this.error(commandsResponse);
            throw new Error('Invalid commands response');
        }
        this.availableCommands = commandsResponse.commands
            .map((cmd) => cmd.key);
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
                return false;
            }
            try {
                await this.syncStatus();
                this.log('Synced status');
            }
            catch (e) {
                this.error("Sync status failed", e);
                return false;
            }
            try {
                await this.syncCommands();
                this.log('Synced commands');
            }
            catch (e) {
                this.error("Sync commands failed", e);
                return false;
            }
            await this.onSync();
            await this.setAvailable();
            this.log("Sync completed");
        }
        catch (e) {
            this.error("Sync failed", e);
            return false;
        }
        return true;
    }
    onSync() {
        return Promise.resolve();
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
                // TODO: only set if not already in this state
                await this.oAuth2Client.setSetting(this.haId, 'BSH.Common.Setting.AmbientLightEnabled', true);
                await this.oAuth2Client.setSetting(this.haId, 'BSH.Common.Setting.AmbientLightColor', 'BSH.Common.EnumType.AmbientLightColor.CustomColor');
                await this.oAuth2Client.setSetting(this.haId, 'BSH.Common.Setting.AmbientLightCustomColor', hex);
            }
            finally {
                this._queuedColor = null;
            }
        }, 200);
    }
    async _setSetting(key, value) {
        return this.oAuth2Client.setSetting(this.haId, key, value);
    }
    async setProgram(programId, options) {
        // Devices with an onoff capability may have been turned off.
        // This ensures that they are turned on, if that is supported by the device.
        if (this.hasCapability('onoff')) {
            const constraints = (await this.oAuth2Client.getSetting(this.haId, 'BSH.Common.Setting.PowerState'))
                .constraints;
            if (constraints && constraints.access !== 'read' && constraints.allowedvalues.indexOf('BSH.Common.EnumType.PowerState.On') > -1) {
                await this._setSetting('BSH.Common.Setting.PowerState', 'BSH.Common.EnumType.PowerState.On');
            }
        }
        return this.oAuth2Client.setProgram(this.haId, programId, options);
    }
    async stopProgram() {
        return this.oAuth2Client.stopProgram(this.haId);
    }
    // Used indirectly.
    async openDoor() {
        if (this.availableCommands.indexOf('BSH.Common.Command.OpenDoor') === -1) {
            throw new Error("Tried to open the door, but this is not supported by the device.");
        }
        await this.oAuth2Client.sendCommand(this.haId, 'BSH.Common.Command.OpenDoor');
    }
    handleEvent(items) {
        if (!Array.isArray(items)) {
            return;
        }
        items.forEach(item => {
            this.callHandler(item.key, item.value)
                .catch(this.error.bind(this));
        });
    }
    async callHandler(key, value) {
        if (DEBUG) {
            this.log(`[${key}] ${value}`);
        }
        if (!this.handlers.hasOwnProperty(key)) {
            if (DEBUG) {
                this.log('No handlers for ' + key);
            }
            return;
        }
        const handler = this.handlers[key];
        if (Array.isArray(handler)) {
            for (const h of handler) {
                await h(value);
            }
        }
        else {
            await handler(value);
        }
    }
    // Function that compares all possible programs with the programs that
    // are supported by the device according to the API
    // It populates the Flow card with the available programs in the user's desired language.
    async setProgramAutoComplete(flowcard) {
        const availablePrograms = await this.oAuth2Client
            .getAvailablePrograms(this.getData().haId);
        this.log(this.haId, availablePrograms);
        flowcard.getArgument('program')
            .registerAutocompleteListener(async (query, _) => {
            return availablePrograms.programs
                // Return an object with the name and description in the user's preferred language
                .map(entry => {
                var _a;
                return {
                    key: entry.key,
                    description: '',
                    name: (_a = entry.name) !== null && _a !== void 0 ? _a : this.homey.__(`${entry}.name`),
                };
            })
                // Filter for the search results
                .filter(item => {
                if ((item === null || item === void 0 ? void 0 : item.name) === null) {
                    return true;
                }
                return item.name.toLowerCase()
                    .includes((query !== null && query !== void 0 ? query : "").toLowerCase());
            });
        });
    }
    async handleDoorAlarm(value) {
        if (this.hasCapability('alarm_contact')) {
            if (value.startsWith('BSH.Common.EnumType.DoorState')) {
                return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open')
                    .catch(this.error);
            }
            else {
                this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.EventPresentState.Present')
                    .catch(this.error);
            }
        }
    }
}
exports.default = HomeConnectDevice;
;
