"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const homey_oauth2app_1 = require("homey-oauth2app");
class HomeConnectDriver extends homey_oauth2app_1.OAuth2Driver {
    async onPairListDevices({ oAuth2Client }) {
        const response = await oAuth2Client.getHomeAppliances();
        this.log(response);
        return response.homeappliances
            .filter(homeAppliance => this._onPairFilter(homeAppliance))
            .map(homeAppliance => ({
            name: homeAppliance.name,
            data: {
                haId: homeAppliance.haId
            },
        }));
    }
    _onPairFilter(homeAppliance) {
        return true;
    }
}
exports.default = HomeConnectDriver;
;
