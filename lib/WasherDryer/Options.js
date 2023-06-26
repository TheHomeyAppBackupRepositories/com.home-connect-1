"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dryerTargetFromArgument = exports.DryerTarget = exports.DryerProgram = exports.washerSpinFromArgument = exports.WasherSpin = exports.washerTemperatureFromArgument = exports.WasherTemperature = exports.WasherProgram = void 0;
var WasherProgram;
(function (WasherProgram) {
    WasherProgram["Cotton"] = "LaundryCare.Washer.Program.Cotton";
    WasherProgram["EasyCare"] = "LaundryCare.Washer.Program.EasyCare";
    WasherProgram["Mix"] = "LaundryCare.Washer.Program.Mix";
    WasherProgram["DelicatesSilk"] = "LaundryCare.Washer.Program.DelicatesSilk";
    WasherProgram["Wool"] = "LaundryCare.Washer.Program.Wool";
    WasherProgram["Sensitive"] = "LaundryCare.Washer.Program.Sensitive";
    WasherProgram["Auto30"] = "LaundryCare.Washer.Program.Auto30";
    WasherProgram["Auto40"] = "LaundryCare.Washer.Program.Auto40";
    WasherProgram["Auto60"] = "LaundryCare.Washer.Program.Auto60";
    WasherProgram["Chiffon"] = "LaundryCare.Washer.Program.Chiffon";
    WasherProgram["Curtains"] = "LaundryCare.Washer.Program.Curtains";
    WasherProgram["DarkWash"] = "LaundryCare.Washer.Program.DarkWash";
    WasherProgram["Dessous"] = "LaundryCare.Washer.Program.Dessous";
    WasherProgram["Monsoon"] = "LaundryCare.Washer.Program.Monsoon";
    WasherProgram["Outdoor"] = "LaundryCare.Washer.Program.Outdoor";
    WasherProgram["PlushToy"] = "LaundryCare.Washer.Program.PlushToy";
    WasherProgram["ShirtsBlouses"] = "LaundryCare.Washer.Program.ShirtsBlouses";
    WasherProgram["SportFitness"] = "LaundryCare.Washer.Program.SportFitness";
    WasherProgram["Towels"] = "LaundryCare.Washer.Program.Towels";
    WasherProgram["WaterProof"] = "LaundryCare.Washer.Program.WaterProof";
})(WasherProgram || (exports.WasherProgram = WasherProgram = {}));
var WasherTemperature;
(function (WasherTemperature) {
    WasherTemperature["Cold"] = "LaundryCare.Washer.EnumType.Temperature.Cold";
    WasherTemperature["20c"] = "LaundryCare.Washer.EnumType.Temperature.GC20";
    WasherTemperature["30c"] = "LaundryCare.Washer.EnumType.Temperature.GC30";
    WasherTemperature["40c"] = "LaundryCare.Washer.EnumType.Temperature.GC40";
    WasherTemperature["50c"] = "LaundryCare.Washer.EnumType.Temperature.GC50";
    WasherTemperature["60c"] = "LaundryCare.Washer.EnumType.Temperature.GC60";
    WasherTemperature["70c"] = "LaundryCare.Washer.EnumType.Temperature.GC70";
    WasherTemperature["80c"] = "LaundryCare.Washer.EnumType.Temperature.GC80";
    WasherTemperature["90c"] = "LaundryCare.Washer.EnumType.Temperature.GC90";
})(WasherTemperature || (exports.WasherTemperature = WasherTemperature = {}));
function washerTemperatureFromArgument(argument) {
    switch (argument) {
        case "cold":
            return WasherTemperature["Cold"];
        case "20c":
            return WasherTemperature["20c"];
        case "30c":
            return WasherTemperature["30c"];
        case "40c":
            return WasherTemperature["40c"];
        case "50c":
            return WasherTemperature["50c"];
        case "60c":
            return WasherTemperature["60c"];
        case "70c":
            return WasherTemperature["70c"];
        case "80c":
            return WasherTemperature["80c"];
        case "90c":
            return WasherTemperature["90c"];
    }
}
exports.washerTemperatureFromArgument = washerTemperatureFromArgument;
var WasherSpin;
(function (WasherSpin) {
    WasherSpin["off"] = "LaundryCare.Washer.EnumType.SpinSpeed.Off";
    WasherSpin["400rpm"] = "LaundryCare.Washer.EnumType.SpinSpeed.RPM400";
    WasherSpin["600rpm"] = "LaundryCare.Washer.EnumType.SpinSpeed.RPM600";
    WasherSpin["800rpm"] = "LaundryCare.Washer.EnumType.SpinSpeed.RPM800";
    WasherSpin["1000rpm"] = "LaundryCare.Washer.EnumType.SpinSpeed.RPM1000";
    WasherSpin["1200rpm"] = "LaundryCare.Washer.EnumType.SpinSpeed.RPM1200";
    WasherSpin["1400rpm"] = "LaundryCare.Washer.EnumType.SpinSpeed.RPM1400";
    WasherSpin["1600rpm"] = "LaundryCare.Washer.EnumType.SpinSpeed.RPM1600";
})(WasherSpin || (exports.WasherSpin = WasherSpin = {}));
function washerSpinFromArgument(argument) {
    switch (argument) {
        case "off":
            return WasherSpin["off"];
        case "400rpm":
            return WasherSpin["400rpm"];
        case "600rpm":
            return WasherSpin["600rpm"];
        case "800rpm":
            return WasherSpin["800rpm"];
        case "1000rpm":
            return WasherSpin["1000rpm"];
        case "1200rpm":
            return WasherSpin["1200rpm"];
        case "1400rpm":
            return WasherSpin["1400rpm"];
        case "1600rpm":
            return WasherSpin["1600rpm"];
    }
}
exports.washerSpinFromArgument = washerSpinFromArgument;
var DryerProgram;
(function (DryerProgram) {
    DryerProgram["Cotton"] = "LaundryCare.Dryer.Program.Cotton";
    DryerProgram["Synthetic"] = "LaundryCare.Dryer.Program.Synthetic";
    DryerProgram["Mix"] = "LaundryCare.Dryer.Program.Mix";
    DryerProgram["Blankets"] = "LaundryCare.Dryer.Program.Blankets";
    DryerProgram["BusinessShirts"] = "LaundryCare.Dryer.Program.BusinessShirts";
    DryerProgram["DownFeathers"] = "LaundryCare.Dryer.Program.DownFeathers";
    DryerProgram["Hygiene"] = "LaundryCare.Dryer.Program.Hygiene";
    DryerProgram["Jeans"] = "LaundryCare.Dryer.Program.Jeans";
    DryerProgram["Outdoor"] = "LaundryCare.Dryer.Program.Outdoor";
    DryerProgram["SyntheticRefresh"] = "LaundryCare.Dryer.Program.SyntheticRefresh";
    DryerProgram["Towels"] = "LaundryCare.Dryer.Program.Towels";
    DryerProgram["Super40"] = "LaundryCare.Dryer.Program.Super40";
    DryerProgram["Shirts15"] = "LaundryCare.Dryer.Program.Shirts15";
    DryerProgram["Pillow"] = "LaundryCare.Dryer.Program.Pillow";
    DryerProgram["AntiShrink"] = "LaundryCare.Dryer.Program.AntiShrink";
})(DryerProgram || (exports.DryerProgram = DryerProgram = {}));
var DryerTarget;
(function (DryerTarget) {
    DryerTarget["IronDry"] = "LaundryCare.Dryer.EnumType.DryingTarget.IronDry";
    DryerTarget["CupboardDry"] = "LaundryCare.Dryer.EnumType.DryingTarget.CupboardDry";
    DryerTarget["CupboardDryPlus"] = "LaundryCare.Dryer.EnumType.DryingTarget.CupboardDryPlus";
})(DryerTarget || (exports.DryerTarget = DryerTarget = {}));
function dryerTargetFromArgument(argument) {
    switch (argument) {
        case "irondry":
            return DryerTarget.IronDry;
        case "cupboarddry":
            return DryerTarget.CupboardDry;
        case "cupboarddryplus":
            return DryerTarget.CupboardDryPlus;
    }
}
exports.dryerTargetFromArgument = dryerTargetFromArgument;
