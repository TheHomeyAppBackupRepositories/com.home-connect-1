"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HomeConnectDevice_1 = __importDefault(require("../../lib/HomeConnectDevice"));
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
        this.listenFor('Cooking.Oven.Status.CurrentCavityTemperature', async (value) => {
            await this.setCapabilityValue('measure_temperature', value);
        });
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
            return this.setProgram(key, options);
        });
        await this.setProgramAutoComplete(programFlowCard);
    }
}
module.exports = HomeConnectDeviceOven;
