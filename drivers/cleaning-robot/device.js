"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HomeConnectDevice_1 = __importDefault(require("../../lib/HomeConnectDevice"));
class HomeConnectDeviceCleaningRobot extends HomeConnectDevice_1.default {
    supportsOffPowerState() {
        return false;
    }
    supportsStandbyPowerState() {
        return true;
    }
    async onOAuth2Init() {
        await super.onOAuth2Init();
        // TODO: The rest.
    }
}
module.exports = HomeConnectDeviceCleaningRobot;
