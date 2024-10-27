'use strict';

import Homey from 'homey';
import { RingApi } from 'ring-client-api'

module.exports = class MyApp extends Homey.App {
  async onInit() {
    this.log('RingAlarmState has been initialized');

    await this.updateRingAlarmState()

    setInterval(() => this.updateRingAlarmState(), 10000)
  }

  async updateRingAlarmState() {
    const ringApi = new RingApi({
      refreshToken: Homey.env.RING_REFRESH_TOKEN,
    })

    ringApi.onRefreshTokenUpdated.subscribe(
        async ({ newRefreshToken, oldRefreshToken }) => {
          // console.log("Refresh Token Updated: ", newRefreshToken);
        }
    );

    // const devices = await ringApi.fetchRingDevices();
    const locations = await ringApi.getLocations();
    const home = locations.find((l) => l.locationDetails.location_id == Homey.env.LOCATION_ID);

    if(home) {
      const state = await home.getAlarmMode();

      this.log(state);
    }
  }

}
