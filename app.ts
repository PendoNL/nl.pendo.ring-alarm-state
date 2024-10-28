'use strict';

import Homey from 'homey';
import { RingApi } from 'ring-client-api'
import { readFile, writeFile } from 'fs'
import { promisify } from 'util'

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

          // If you are implementing a project that use `ring-client-api`, you should subscribe to onRefreshTokenUpdated and update your config each time it fires an event
          // Here is an example using a .env file for configuration
          /*if (!oldRefreshToken) {
            return
          }

          const currentConfig = await promisify(readFile)('../env.json'),
              updatedConfig = currentConfig
                  .toString()
                  .replace(oldRefreshToken, newRefreshToken)

          await promisify(writeFile)('../env.json', updatedConfig)*/
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
