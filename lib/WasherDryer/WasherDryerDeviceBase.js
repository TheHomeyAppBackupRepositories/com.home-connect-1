"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HomeConnectDevice_1 = __importDefault(require("../HomeConnectDevice"));
const Options_1 = require("./Options");
const washerProgramMap = {
    cotton: 'LaundryCare.Washer.Program.Cotton',
    easycare: 'LaundryCare.Washer.Program.EasyCare',
    mix: 'LaundryCare.Washer.Program.Mix',
    silk: 'LaundryCare.Washer.Program.DelicatesSilk',
    wool: 'LaundryCare.Washer.Program.Wool',
};
const dryerProgramMap = {
    cotton: 'LaundryCare.Dryer.Program.Cotton',
    synthetic: 'LaundryCare.Dryer.Program.Synthetic',
    mix: 'LaundryCare.Dryer.Program.Mix',
};
class WasherDryerDeviceBase extends HomeConnectDevice_1.default {
    async createWasherFlowCard() {
        const flowCard = this.homey.flow.getActionCard('program_washer');
        flowCard.registerRunListener(async (args) => {
            const key = ((typeof args.program === 'string') ? washerProgramMap[args.program] : args.program.key);
            const options = [];
            if (args.temperature !== 'program_default') {
                options.push({
                    key: "LaundryCare.Washer.Option.Temperature" /* WasherOptionKeys.Temperature */,
                    value: (0, Options_1.washerTemperatureFromArgument)(args.temperature)
                });
            }
            if (args.spin !== 'program_default') {
                options.push({
                    key: "LaundryCare.Washer.Option.SpinSpeed" /* WasherOptionKeys.SpinSpeed */,
                    value: (0, Options_1.washerSpinFromArgument)(args.spin)
                });
            }
            return this.setProgram(key, options);
        });
        await this.setProgramAutoComplete(flowCard);
    }
    async createDryerFlowCard() {
        const flowCard = this.homey.flow.getActionCard('program_dryer');
        flowCard.registerRunListener(async (args) => {
            const key = ((typeof args.program === 'string') ? dryerProgramMap[args.program] : args.program.key);
            const options = [];
            if (args.target !== 'program_default') {
                options.push({
                    key: "LaundryCare.Dryer.Option.DryingTarget" /* DryerOptionKeys.Target */,
                    value: (0, Options_1.dryerTargetFromArgument)(args.target)
                });
            }
            return this.setProgram(key, options);
        });
        await this.setProgramAutoComplete(flowCard);
    }
}
exports.default = WasherDryerDeviceBase;
