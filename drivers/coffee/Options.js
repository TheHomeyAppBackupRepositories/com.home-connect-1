"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoffeeProgram = exports.beanAmountFromArgument = void 0;
function beanAmountFromArgument(argument) {
    switch (argument) {
        case "mild":
            return "ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.Mild" /* BeanAmount.Mild */;
        case "normal":
            return "ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.Normal" /* BeanAmount.Normal */;
        case "strong":
            return "ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.Strong" /* BeanAmount.Strong */;
        case "verystrong":
            return "ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.VeryStrong" /* BeanAmount.VeryStrong */;
        case "doubleshot":
            return "ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.DoubleShot" /* BeanAmount.DoubleShot */;
        case "doubleshotplus":
            return "ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.DoubleShotPlus" /* BeanAmount.DoubleShotPlus */;
    }
}
exports.beanAmountFromArgument = beanAmountFromArgument;
var CoffeeProgram;
(function (CoffeeProgram) {
    CoffeeProgram["Ristretto"] = "ConsumerProducts.CoffeeMaker.Program.Beverage.Ristretto";
    CoffeeProgram["Espresso"] = "ConsumerProducts.CoffeeMaker.Program.Beverage.Espresso";
    CoffeeProgram["EspressoDoppio"] = "ConsumerProducts.CoffeeMaker.Program.Beverage.EspressoDoppio";
    CoffeeProgram["Coffee"] = "ConsumerProducts.CoffeeMaker.Program.Beverage.Coffee";
    CoffeeProgram["EspressoMacchiato"] = "ConsumerProducts.CoffeeMaker.Program.Beverage.EspressoMacchiato";
    CoffeeProgram["Cappuccino"] = "ConsumerProducts.CoffeeMaker.Program.Beverage.Cappuccino";
    CoffeeProgram["LatteMacchiato"] = "ConsumerProducts.CoffeeMaker.Program.Beverage.LatteMacchiato";
    CoffeeProgram["CaffeLatte"] = "ConsumerProducts.CoffeeMaker.Program.Beverage.CaffeLatte";
    CoffeeProgram["MilkFroth"] = "ConsumerProducts.CoffeeMaker.Program.Beverage.MilkFroth";
    CoffeeProgram["WarmMilk"] = "ConsumerProducts.CoffeeMaker.Program.Beverage.WarmMilk";
    CoffeeProgram["KleinerBrauner"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.KleinerBrauner";
    CoffeeProgram["GrosserBrauner"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.GrosserBrauner";
    CoffeeProgram["Verlaengerter"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.Verlaengerter";
    CoffeeProgram["VerlaengerterBraun"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.VerlaengerterBraun";
    CoffeeProgram["WienerMelange"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.WienerMelange";
    CoffeeProgram["FlatWhite"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.FlatWhite";
    CoffeeProgram["Cortado"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.Cortado";
    CoffeeProgram["CafeCortado"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.CafeCortado";
    CoffeeProgram["CafeConLeche"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.CafeConLeche";
    CoffeeProgram["CafeAuLait"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.CafeAuLait";
    CoffeeProgram["Doppio"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.Doppio";
    CoffeeProgram["Kaapi"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.Kaapi";
    CoffeeProgram["KoffieVerkeerd"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.KoffieVerkeerd";
    CoffeeProgram["Galao"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.Galao";
    CoffeeProgram["Garoto"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.Garoto";
    CoffeeProgram["Americano"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.Americano";
    CoffeeProgram["RedEye"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.RedEye";
    CoffeeProgram["BlackEye"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.BlackEye";
    CoffeeProgram["DeadEye"] = "ConsumerProducts.CoffeeMaker.Program.CoffeeWorld.DeadEye";
})(CoffeeProgram || (exports.CoffeeProgram = CoffeeProgram = {}));
