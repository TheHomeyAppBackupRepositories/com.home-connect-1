"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CoolingDeviceBase_1 = __importDefault(require("../../lib/CoolingDeviceBase"));
class HomeConnectDeviceFridge extends CoolingDeviceBase_1.default {
    async onOAuth2Init() {
        await super.onOAuth2Init();
        await this.setRefrigeratorImages();
        this.homey.flow.getActionCard('set_freezer_temperature')
            .registerRunListener(async (args) => {
            return this._setSetting('Refrigeration.FridgeFreezer.Setting.SetpointTemperatureFreezer', args.temperature);
        });
    }
    getCapabilityMap() {
        return [
            {
                setting: 'Refrigeration.FridgeFreezer.Setting.SetpointTemperatureRefrigerator',
                capability: 'target_temperature',
            },
            {
                setting: 'Refrigeration.FridgeFreezer.Setting.SetpointTemperatureFreezer',
                capability: 'target_temperature.freezer',
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
module.exports = HomeConnectDeviceFridge;
