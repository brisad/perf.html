/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// @flow

import { selectedThreadSelectors } from '../../selectors/per-thread';

import { storeWithProfile } from '../fixtures/stores';
import {
  getProfileFromTextSamples,
  getProfileWithMarkers,
  getNetworkMarkers,
  getProfileWithJsTracerEvents,
} from '../fixtures/profiles/processed-profile';

describe('getUsefulTabs', function() {
  it('hides the network chart and JS tracer when no data is in the thread', function() {
    const { profile } = getProfileFromTextSamples('A');
    const { getState } = storeWithProfile(profile);
    expect(selectedThreadSelectors.getUsefulTabs(getState())).toEqual([
      'calltree',
      'flame-graph',
      'stack-chart',
      'marker-chart',
      'marker-table',
    ]);
  });

  it('shows the network chart when network markers are present in the thread', function() {
    const profile = getProfileWithMarkers(getNetworkMarkers());
    const { getState } = storeWithProfile(profile);
    expect(selectedThreadSelectors.getUsefulTabs(getState())).toEqual([
      'calltree',
      'flame-graph',
      'stack-chart',
      'marker-chart',
      'marker-table',
      'network-chart',
    ]);
  });

  it('shows the js tracer when it is available in a thread', function() {
    const profile = getProfileWithJsTracerEvents([['A', 0, 10]]);
    const { getState } = storeWithProfile(profile);
    expect(selectedThreadSelectors.getUsefulTabs(getState())).toEqual([
      'calltree',
      'flame-graph',
      'stack-chart',
      'marker-chart',
      'marker-table',
      'js-tracer',
    ]);
  });
});
