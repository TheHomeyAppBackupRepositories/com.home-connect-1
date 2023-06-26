"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HomeConnectDevice_1 = __importDefault(require("../../lib/HomeConnectDevice"));
const Options_1 = require("./Options");
const programMap = {
    preheat: 'Cooking.Oven.Program.HeatingMode.PreHeating',
    pizza: 'Cooking.Oven.Program.HeatingMode.PizzaSetting',
    hotair: 'Cooking.Oven.Program.HeatingMode.HotAir',
    topbottom: 'Cooking.Oven.Program.HeatingMode.TopBottomHeating',
};
class HomeConnectDeviceOven extends HomeConnectDevice_1.default {
    supportsOffPowerState() {
        return false;
    }
    supportsStandbyPowerState() {
        return true;
    }
    async onOAuth2Init() {
        await super.onOAuth2Init();
        // Get a list of available programs and find them in the 'AllPrograms' array,
        // which is the data shown to the user.
        const programFlowCard = this.homey.flow.getActionCard('program_oven');
        programFlowCard.registerRunListener(async (args) => {
            const key = ((typeof args.program === 'string') ? programMap[args.program] : args.program.key);
            const options = [];
            if (args.temperature) {
                options.push({
                    key: "Cooking.Oven.Option.SetpointTemperature" /* OvenOptionKeys.Temperature */,
                    value: args.temperature,
                    unit: '°C',
                });
            }
            if (args.duration) {
                options.push({
                    key: 'BSH.Common.Option.Duration',
                    value: args.duration / 1000,
                    unit: 'seconds',
                });
            }
            return this._setProgram(key, options);
        });
        await this.setProgramAutoComplete(programFlowCard, Object.values(Options_1.OvenProgram));
    }
    async _parseStatus(key, value) {
        if (key === 'Cooking.Oven.Status.CurrentCavityTemperature') {
            return this.setCapabilityValue('measure_temperature', value);
        }
        if (key === 'BSH.Common.Status.DoorState') {
            return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open');
        }
        return Promise.resolve();
    }
    async _parseNotify(key, value) {
        if (key === 'Cooking.Oven.Status.CurrentCavityTemperature') {
            return this.setCapabilityValue('measure_temperature', value);
        }
        return Promise.resolve();
    }
}
module.exports = HomeConnectDeviceOven;
