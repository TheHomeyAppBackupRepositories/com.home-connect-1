"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeConnectDeviceHood = void 0;
const HomeConnectDevice_1 = __importDefault(require("../../lib/HomeConnectDevice"));
const Util_1 = __importDefault(require("../../lib/Util"));
const Options_1 = require("./Options");
const ventingLevelMap = {
    venting_off: 'Cooking.Hood.EnumType.Stage.FanOff',
    venting_1: 'Cooking.Hood.EnumType.Stage.FanStage01',
    venting_2: 'Cooking.Hood.EnumType.Stage.FanStage02',
    venting_3: 'Cooking.Hood.EnumType.Stage.FanStage03',
    venting_4: 'Cooking.Hood.EnumType.Stage.FanStage04',
    venting_5: 'Cooking.Hood.EnumType.Stage.FanStage05',
    intensive_off: 'Cooking.Hood.EnumType.IntensiveStage.IntensiveStageOff',
    intensive_1: 'Cooking.Hood.EnumType.IntensiveStage.IntensiveStage1',
    intensive_2: 'Cooking.Hood.EnumType.IntensiveStage.IntensiveStage2',
};
const levelMap = {
    venting: 'Cooking.Common.Option.Hood.VentingLevel',
    intensive: 'Cooking.Common.Option.Hood.IntensiveLevel',
};
class HomeConnectDeviceHood extends HomeConnectDevice_1.default {
    supportsOffPowerState() {
        return true;
    }
    supportsStandbyPowerState() {
        return false;
    }
    async onOAuth2Init() {
        await super.onOAuth2Init();
        this.listenFor('Cooking.Common.Option.Hood.VentingLevel', this.onLevel.bind(this));
        this.listenFor('Cooking.Common.Option.Hood.IntensiveLevel', this.onLevel.bind(this));
        this.listenFor('Cooking.Common.Setting.LightingBrightness', async (value) => {
            await this.checkDimCapability();
            const brightness = Util_1.default.scale(value, [10.0, 100.0], [0.0, 1.0]);
            this.log(`Setting brightness to ${brightness}, mapped from ${value}`);
            await this.setCapabilityValue("dim", brightness);
        });
        this.listenFor('Cooking.Common.Setting.Lighting', async (value) => {
            await this.checkDimCapability();
            if (!value) {
                await this.setCapabilityValue("dim", 0);
            }
        });
        this.registerCapabilityListener('venting_level', this.onCapabilityVentingLevel.bind(this));
        if (this.hasCapability("dim")) {
            this.registerLightCapabilityListener();
        }
    }
    async onLevel(value) {
        const level = Util_1.default.keyByValue(ventingLevelMap, value);
        if (!level.includes('off')) {
            return this.setCapabilityValue('venting_level', level);
        }
    }
    async startVenting(level, ventingLevel) {
        return this.setProgram(Options_1.HoodProgram.Venting, [
            {
                key: level,
                value: ventingLevel,
            },
        ]);
    }
    async startProgram(programId) {
        return this.setProgram(programId, []);
    }
    async checkDimCapability() {
        if (!this.hasCapability("dim")) {
            this.log("Detected hood lighting support");
            await this.addCapability("dim");
            this.registerLightCapabilityListener();
        }
    }
    registerLightCapabilityListener() {
        this.registerCapabilityListener("dim", async (value) => {
            // Lighting support 10 to 100. If it is zero, just turn it off, otherwise
            // map [0.0, 1.0] to [10, 100] range.
            if (value === 0) {
                await this.oAuth2Client.setSetting(this.haId, "Cooking.Common.Setting.Lighting", false);
            }
            else {
                const brightness = Util_1.default.scale(value, [0.0, 1.0], [10.0, 100.0]);
                this.log(`Setting brightness to ${brightness}, mapped from ${value}`);
                await this.oAuth2Client.setSetting(this.haId, "Cooking.Common.Setting.LightingBrightness", brightness);
            }
        });
    }
    /*
     * Capability Listeners
     */
    async onCapabilityVentingLevel(value) {
        const types = value.split('_');
        return this.startVenting(levelMap[types[0]], ventingLevelMap[value]);
    }
}
exports.HomeConnectDeviceHood = HomeConnectDeviceHood;
module.exports = HomeConnectDeviceHood;
