"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Options_1 = require("./Options");
const HomeConnectDriver_1 = __importDefault(require("../../lib/HomeConnectDriver"));
const ventingLevelMap = {
    venting_off: ' Cooking.Hood.EnumType.Stage.FanOff',
    venting_1: 'Cooking.Hood.EnumType.Stage.FanStage01',
    venting_2: 'Cooking.Hood.EnumType.Stage.FanStage02',
    venting_3: 'Cooking.Hood.EnumType.Stage.FanStage03',
    venting_4: 'Cooking.Hood.EnumType.Stage.FanStage04',
    venting_5: 'Cooking.Hood.EnumType.Stage.FanStage05',
    intensive_off: 'Cooking.Hood.EnumType.IntensiveStage.IntensiveStageOff',
    intensive_1: 'Cooking.Hood.EnumType.IntensiveStage.IntensiveStage1',
    intensive_2: 'Cooking.Hood.EnumType.IntensiveStage.IntensiveStage2',
};
const levelMap = {
    venting: 'Cooking.Common.Option.Hood.VentingLevel',
    intensive: 'Cooking.Common.Option.Hood.IntensiveLevel',
};
class HomeConnectDriverHood extends HomeConnectDriver_1.default {
    async onOAuth2Init() {
        await super.onOAuth2Init();
        this.homey.flow.getActionCard('program_venting')
            .registerRunListener(async (args) => {
            const types = args.venting_level.split('_');
            return args.device.startVenting(levelMap[types[0]], ventingLevelMap[args.venting_level]);
        });
        this.homey.flow.getActionCard('program_automatic')
            .registerRunListener(async (args) => {
            return args.device.startProgram(Options_1.HoodProgram.Automatic);
        });
        this.homey.flow.getActionCard('program_delayed_shut_off')
            .registerRunListener(async (args) => {
            return args.device
                .startProgram(Options_1.HoodProgram.DelayedShutOff);
        });
    }
    _onPairFilter(homeAppliance) {
        return homeAppliance.type === 'Hood';
    }
}
module.exports = HomeConnectDriverHood;
