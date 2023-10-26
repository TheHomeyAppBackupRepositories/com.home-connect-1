"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WasherDryerDeviceBase_1 = __importDefault(require("../../lib/WasherDryer/WasherDryerDeviceBase"));
class HomeConnectDeviceWasher extends WasherDryerDeviceBase_1.default {
    async onOAuth2Init() {
        await super.onOAuth2Init();
        await this.createWasherFlowCard();
        await this.createDryerFlowCard();
    }
    supportsOffPowerState() {
        return false;
    }
    supportsStandbyPowerState() {
        return false;
    }
}
module.exports = HomeConnectDeviceWasher;
