"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoodProgram = exports.VentingLevelCategory = exports.VentingLevel = void 0;
var VentingLevel;
(function (VentingLevel) {
    VentingLevel["VentingOff"] = "Cooking.Hood.EnumType.Stage.FanOff";
    VentingLevel["Venting1"] = "Cooking.Hood.EnumType.Stage.FanStage01";
    VentingLevel["Venting2"] = "Cooking.Hood.EnumType.Stage.FanStage02";
    VentingLevel["Venting3"] = "Cooking.Hood.EnumType.Stage.FanStage03";
    VentingLevel["Venting4"] = "Cooking.Hood.EnumType.Stage.FanStage04";
    VentingLevel["Venting5"] = "Cooking.Hood.EnumType.Stage.FanStage05";
    VentingLevel["IntensiveOff"] = "Cooking.Hood.EnumType.IntensiveStage.IntensiveStageOff";
    VentingLevel["Intensive1"] = "Cooking.Hood.EnumType.IntensiveStage.IntensiveStage1";
    VentingLevel["Intensive2"] = "Cooking.Hood.EnumType.IntensiveStage.IntensiveStage2";
})(VentingLevel || (exports.VentingLevel = VentingLevel = {}));
var VentingLevelCategory;
(function (VentingLevelCategory) {
    VentingLevelCategory["Venting"] = "Cooking.Common.Option.Hood.VentingLevel";
    VentingLevelCategory["Intensive"] = "Cooking.Common.Option.Hood.IntensiveLevel";
})(VentingLevelCategory || (exports.VentingLevelCategory = VentingLevelCategory = {}));
var HoodProgram;
(function (HoodProgram) {
    HoodProgram["Automatic"] = "Cooking.Common.Program.Hood.Automatic";
    HoodProgram["Venting"] = "Cooking.Common.Program.Hood.Venting";
    HoodProgram["DelayedShutOff"] = "Cooking.Common.Program.Hood.DelayedShutOff";
})(HoodProgram || (exports.HoodProgram = HoodProgram = {}));
