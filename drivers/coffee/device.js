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
        this.listenFor('ConsumerProducts.CoffeeMaker.Event.WaterTankEmpty', async (value) => {
            await this.homey.flow.getDeviceTriggerCard('water_tank_empty')
                .trigger(this);
        });
        this.listenFor('ConsumerProducts.CoffeeMaker.Event.BeanContainerEmpty', async (value) => {
            await this.homey.flow.getDeviceTriggerCard('bean_container_empty')
                .trigger(this);
        });
        this.listenFor('ConsumerProducts.CoffeeMaker.Event.DripTrayFull', async (value) => {
            await this.homey.flow.getDeviceTriggerCard('drip_tray_full')
                .trigger(this);
        });
        this.listenFor('BSH.Common.Status.DoorState', async (value) => {
            await this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open');
        });
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
            return this.setProgram(key, options);
        });
        await this.setProgramAutoComplete(programFlowCard);
    }
}
module.exports = HomeConnectDeviceCoffee;
