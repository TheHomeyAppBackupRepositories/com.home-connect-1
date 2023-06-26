"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WasherDryerDeviceBase_1 = __importDefault(require("../../lib/WasherDryer/WasherDryerDeviceBase"));
class HomeConnectDeviceWasher extends WasherDryerDeviceBase_1.default {
    async onSync() {
        await this.createWasherFlowCard();
    }
    supportsOffPowerState() {
        return false;
    }
    supportsStandbyPowerState() {
        return false;
    }
}
module.exports = HomeConnectDeviceWasher;
