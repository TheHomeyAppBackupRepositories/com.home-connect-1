"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HomeConnectDevice_1 = __importDefault(require("../../lib/HomeConnectDevice"));
const Options_1 = require("./Options");
const programMap = {
    espresso: 'ConsumerProducts.CoffeeMaker.Program.Beverage.Espresso',
    espressomacchiato: 'ConsumerProducts.CoffeeMaker.Program.Beverage.EspressoMacchiato',
    coffee: 'ConsumerProducts.CoffeeMaker.Program.Beverage.Coffee',
    cappuccino: 'ConsumerProducts.CoffeeMaker.Program.Beverage.Cappuccino',
    lattemacchiato: 'ConsumerProducts.CoffeeMaker.Program.Beverage.LatteMacchiato',
    cafelatte: 'ConsumerProducts.CoffeeMaker.Program.Beverage.CaffeLatte',
};
class HomeConnectDeviceCoffee extends HomeConnectDevice_1.default {
    supportsOffPowerState() {
        return false;
    }
    supportsStandbyPowerState() {
        return true;
    }
    async onOAuth2Init() {
        await super.onOAuth2Init();
        const programFlowCard = this.homey.flow.getActionCard('program_coffee');
        programFlowCard.registerRunListener(async (args) => {
            // Note: if program is a string, this is a legacy flow. No need to take care of it
            // beyond this point.
            const key = ((typeof args.program === 'string') ? programMap[args.program] : args.program.key);
            const options = [];
            if (args.bean_amount !== 'program_default') {
                options.push({
                    key: "ConsumerProducts.CoffeeMaker.Option.BeanAmount" /* CoffeeMachineOptionKeys.BeanAmount */,
                    value: (0, Options_1.beanAmountFromArgument)(args.bean_amount),
                });
            }
            if (args.fill_quantity) {
                options.push({
                    key: "ConsumerProducts.CoffeeMaker.Option.FillQuantity" /* CoffeeMachineOptionKeys.FillQuantity */,
                    value: args.fill_quantity,
                });
            }
            return this._setProgram(key, options);
        });
        await this.setProgramAutoComplete(programFlowCard, Object.values(Options_1.CoffeeProgram));
    }
    async _parseEvent(key, value) {
        if (key === 'ConsumerProducts.CoffeeMaker.Event.WaterTankEmpty') {
            await this.homey.flow.getDeviceTriggerCard('water_tank_empty')
                .trigger(this);
        }
        if (key === 'ConsumerProducts.CoffeeMaker.Event.BeanContainerEmpty') {
            await this.homey.flow.getDeviceTriggerCard('bean_container_empty')
                .trigger(this);
        }
        if (key === 'ConsumerProducts.CoffeeMaker.Event.DripTrayFull') {
            await this.homey.flow.getDeviceTriggerCard('drip_tray_full')
                .trigger(this);
        }
    }
    async _parseStatus(key, value) {
        if (key === 'BSH.Common.Status.DoorState') {
            await this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open');
        }
    }
}
module.exports = HomeConnectDeviceCoffee;
