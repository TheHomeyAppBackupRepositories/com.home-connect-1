"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HomeConnectDevice_1 = __importDefault(require("./HomeConnectDevice"));
// This class is used as a basis for several cooling devices:
// Fridges, FridgeFreezers, Freezers and WineCoolers
class CoolingDeviceBase extends HomeConnectDevice_1.default {
    async onOAuth2Init() {
        await super.onOAuth2Init();
        const promises = this.getCapabilityMap().map(async (mapping) => {
            const { setting, capability } = mapping;
            try {
                // add the capability if it is not initialized already
                if (!this.hasCapability(capability)) {
                    await this.addCapability(capability);
                }
                // On init we request the min and max temperature of each wineCooler compartiment,
                // Such that we can display a nice thermostat to the user.
                const settingDetails = await this.oAuth2Client.getSetting(this.haId, setting);
                await this.setCapabilityOptions(capability, {
                    ...this.getCapabilityOptions(capability),
                    min: settingDetails.constraints.min,
                    max: settingDetails.constraints.max,
                });
                // Immediately set the temperature
                await this.setCapabilityValue(capability, settingDetails.value);
                // When the user changes a value then send the new setting
                this.registerCapabilityListener(capability, async (value) => {
                    return this._setSetting(setting, value);
                });
            }
            catch (err) {
                this.error(err);
            }
        });
        await Promise.all(promises);
    }
    async setRefrigeratorImages() {
        const images = await this.oAuth2Client.getImages(this.haId);
        await this.createAndSetImageFromAPI(images, 'Refrigeration.Common.Status.DoorCameraPresentRefrigerator', 'fridgeDoor', `${this.homey.__('fridge')} - ${this.homey.__('door')}`);
        await this.createAndSetImageFromAPI(images, 'Refrigeration.Common.Status.InteriorCameraPresentRefrigerator', 'fridgeInterior', `${this.homey.__('fridge')} - ${this.homey.__('interior')}`);
    }
    async createAndSetImageFromAPI(images, key, id, title) {
        if (!images.find(image => image.key === key)) {
            this.log(`Image ${key} (${title}) not available`, images);
            return;
        }
        this.image = await this.homey.images.createImage();
        this.log(`Loading image ${id} (${title})`);
        if (this.image.setStream) {
            this.image.setStream(async (stream) => {
                return this._onGetStream(key, stream);
            });
        }
        else {
            // TODO: setBuffer does not exist, backwards compatibility?
            // @ts-ignore
            this.image.setBuffer(async () => {
                return this._onGetBuffer(key);
            });
        }
        await this.setCameraImage(id, title, this.image);
    }
    async _onGetImage(key) {
        const images = await this.oAuth2Client.getImages(this.haId);
        images.sort((a, b) => b.timestamp - a.timestamp);
        const image = images.find(img => img.key === key);
        if (!image) {
            throw new Error('missing_image');
        }
        return image;
    }
    async _onGetStream(key, stream) {
        const image = await this._onGetImage(key);
        const body = await this.oAuth2Client.getImage(this.haId, image.imagekey, true);
        return body.pipe(stream);
    }
    async _onGetBuffer(key) {
        const image = await this._onGetImage(key);
        return this.oAuth2Client.getImage(this.haId, image.imagekey, false);
    }
    async _parseStatus(key, value) {
        if (key === 'BSH.Common.Status.DoorState') {
            return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open');
        }
        return this.handleTemperatureCapabilities(key, value);
    }
    async _parseSetting(key, value) {
        return this.handleTemperatureCapabilities(key, value);
    }
    async _parseNotify(key, value) {
        return this.handleTemperatureCapabilities(key, value);
    }
    async handleTemperatureCapabilities(key, value) {
        for (const { setting, capability } of this.getCapabilityMap()) {
            if (key === setting) {
                return this.setCapabilityValue(capability, value);
            }
        }
        return Promise.resolve();
    }
}
exports.default = CoolingDeviceBase;
