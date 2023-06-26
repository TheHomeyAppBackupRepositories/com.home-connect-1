"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CoolingDeviceBase_1 = __importDefault(require("../../lib/CoolingDeviceBase"));
class HomeConnectDeviceWineCooler extends CoolingDeviceBase_1.default {
    getCapabilityMap() {
        return [
            {
                setting: 'Refrigeration.Common.Setting.WineCompartment.SetpointTemperature',
                capability: 'target_temperature',
            },
            {
                setting: 'Refrigeration.Common.Setting.WineCompartment2.SetpointTemperature',
                capability: 'target_temperature.compartment2',
            },
            {
                setting: 'Refrigeration.Common.Setting.WineCompartment3.SetpointTemperature',
                capability: 'target_temperature.compartment3',
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
module.exports = HomeConnectDeviceWineCooler;
