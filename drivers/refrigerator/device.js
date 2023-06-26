"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CoolingDeviceBase_1 = __importDefault(require("../../lib/CoolingDeviceBase"));
class HomeConnectDeviceRefrigerator extends CoolingDeviceBase_1.default {
    async onOAuth2Init() {
        await super.onOAuth2Init();
        await this.setRefrigeratorImages();
    }
    getCapabilityMap() {
        return [
            {
                setting: 'Refrigeration.FridgeFreezer.Setting.SetpointTemperatureRefrigerator',
                capability: 'target_temperature',
            },
        ];
    }
    supportsOffPowerState() {
        return false;
    }
    supportsStandbyPowerState() {
        return false;
    }
}
module.exports = HomeConnectDeviceRefrigerator;
