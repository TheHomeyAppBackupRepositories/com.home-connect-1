"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HomeConnectDevice_1 = __importDefault(require("../../lib/HomeConnectDevice"));
const programMap = {
    auto1: 'Dishcare.Dishwasher.Program.Auto1',
    auto2: 'Dishcare.Dishwasher.Program.Auto2',
    auto3: 'Dishcare.Dishwasher.Program.Auto3',
    eco50: 'Dishcare.Dishwasher.Program.Eco50',
    quick45: 'Dishcare.Dishwasher.Program.Quick45',
};
class HomeConnectDeviceDishwasher extends HomeConnectDevice_1.default {
    supportsOffPowerState() {
        return true;
    }
    supportsStandbyPowerState() {
        return false;
    }
    async onOAuth2Init() {
        // migration
        if (!this.hasCapability('onoff')) {
            await this.addCapability('onoff');
        }
        this.listenFor('Dishcare.Dishwasher.Event.SaltNearlyEmpty', async (_) => {
            await this.homey.flow.getDeviceTriggerCard('salt_nearly_empty')
                .trigger(this);
        });
        this.listenFor('Dishcare.Dishwasher.Event.RinseAidNearlyEmpty', async (_) => {
            await this.homey.flow.getDeviceTriggerCard('rinse_aid_nearly_empty')
                .trigger(this);
        });
        await super.onOAuth2Init();
        const programFlowCard = this.homey.flow.getActionCard('program_dishwasher');
        programFlowCard.registerRunListener(async (args) => {
            const key = ((typeof args.program === 'string') ? programMap[args.program] : args.program.key);
            return this.setProgram(key, []);
        });
        await this.setProgramAutoComplete(programFlowCard);
    }
    async _parseStatus(key, value) {
        if (key === 'BSH.Common.Status.DoorState') {
            await this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open');
        }
    }
}
module.exports = HomeConnectDeviceDishwasher;
