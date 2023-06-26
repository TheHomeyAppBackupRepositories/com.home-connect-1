"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CoolingDeviceBase_1 = __importDefault(require("../../lib/CoolingDeviceBase"));
class HomeConnectDeviceFreezer extends CoolingDeviceBase_1.default {
    getCapabilityMap() {
        return [
            {
                setting: 'Refrigeration.FridgeFreezer.Setting.SetpointTemperatureFreezer',
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
module.exports = HomeConnectDeviceFreezer;
