"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeConnectDeviceCooktop = void 0;
const HomeConnectDevice_1 = __importDefault(require("../../lib/HomeConnectDevice"));
class HomeConnectDeviceCooktop extends HomeConnectDevice_1.default {
    supportsOffPowerState() {
        return true;
    }
    supportsStandbyPowerState() {
        return false;
    }
    async onOAuth2Init() {
        await super.onOAuth2Init();
    }
}
exports.HomeConnectDeviceCooktop = HomeConnectDeviceCooktop;
module.exports = HomeConnectDeviceCooktop;
