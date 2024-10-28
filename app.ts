'use strict';

import Homey from 'homey';
import { RingApi } from 'ring-client-api'

module.exports = class MyApp extends Homey.App {
  async onInit() {
    this.log('RingAlarmState has been initialized');

    const ringAlarmState = await this.updateRingAlarmState();

    this.homey.settings.set('ring_alarm_state', ringAlarmState)

    setInterval(() => this.updateRingAlarmState(), 10000)
  }

  async updateRingAlarmState() {
    const ringApi = new RingApi({
      refreshToken: Homey.env.RING_REFRESH_TOKEN,
    })

    ringApi.onRefreshTokenUpdated.subscribe(
        async ({ newRefreshToken, oldRefreshToken }) => {
          // console.log('Refresh Token Updated: ', newRefreshToken)

          // See https://github.com/dgreif/ring/blob/02515613123584e2aafc67c84941650698f7eefc/examples/example.ts#L22-L39
        }
    );

    const ringArmedStateChanged = this.homey.flow.getTriggerCard('ring-armed-state-changed');

    // const devices = await ringApi.fetchRingDevices();
    const locations = await ringApi.getLocations();
    const home = locations.find((l) => l.locationDetails.location_id == Homey.env.LOCATION_ID);

    if(home) {
        const state = await home.getAlarmMode();

        if(this.homey.settings.get('ring_alarm_state') !== state) {
            this.homey.settings.set('ring_alarm_state', state)

            await ringArmedStateChanged.trigger({
                'armed-state': state
            });

            console.log('state changed to ' + state);
        }
    }
  }

}
