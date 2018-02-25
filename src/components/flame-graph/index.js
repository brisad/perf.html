/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow
import * as React from 'react';
import explicitConnect from '../../utils/connect';
import FlameGraphCanvas from './Canvas';
import {
  selectedThreadSelectors,
  getDisplayRange,
  getProfileViewOptions,
} from '../../reducers/profile-view';
import FlameGraphSettings from './Settings';
import { getSelectedThreadIndex } from '../../reducers/url-state';
import TransformNavigator from '../calltree/TransformNavigator';
import ContextMenuTrigger from '../shared/ContextMenuTrigger';
import { getCallNodePath } from '../../profile-logic/profile-data';
import { changeSelectedCallNode } from '../../actions/profile-view';

import type { Thread } from '../../types/profile';
import type { Milliseconds } from '../../types/units';
import type { FlameGraphTiming } from '../../profile-logic/flame-graph';
import type { ProfileSelection } from '../../types/actions';
import type {
  CallNodeInfo,
  IndexIntoCallNodeTable,
} from '../../types/profile-derived';

import type {
  ExplicitConnectOptions,
  ConnectedProps,
} from '../../utils/connect';

require('./index.css');

const STACK_FRAME_HEIGHT = 16;

type StateProps = {|
  +thread: Thread,
  +maxStackDepth: number,
  +timeRange: { start: Milliseconds, end: Milliseconds },
  +selection: ProfileSelection,
  +flameGraphTiming: FlameGraphTiming,
  +threadName: string,
  +processDetails: string,
  +callNodeInfo: CallNodeInfo,
  +threadIndex: number,
|};

type DispatchProps = {|
  +changeSelectedCallNode: typeof changeSelectedCallNode,
|};

type Props = ConnectedProps<{||}, StateProps, DispatchProps>;

class FlameGraph extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    (this: any)._onSelectedCallNodeChange = this._onSelectedCallNodeChange.bind(
      this
    );
  }

  _onSelectedCallNodeChange(callNodeIndex: IndexIntoCallNodeTable) {
    const { callNodeInfo, threadIndex, changeSelectedCallNode } = this.props;
    changeSelectedCallNode(
      threadIndex,
      getCallNodePath(callNodeIndex, callNodeInfo.callNodeTable)
    );
  }

  render() {
    const {
      thread,
      threadIndex,
      maxStackDepth,
      flameGraphTiming,
      callNodeInfo,
      timeRange,
      selection,
      threadName,
      processDetails,
    } = this.props;

    const maxViewportHeight = maxStackDepth * STACK_FRAME_HEIGHT;

    return (
      <div className="flameGraph">
        <FlameGraphSettings />
        <TransformNavigator />
        <ContextMenuTrigger
          id={'ProfileCallTreeContextMenu'}
          attributes={{
            className: 'treeViewContextMenu',
          }}
        >
          <div className="flameGraphContent">
            <div title={processDetails} className="flameGraphLabels grippy">
              <span>{threadName}</span>
            </div>
            <FlameGraphCanvas
              key={threadIndex}
              // ChartViewport props
              viewportProps={{
                timeRange,
                maxViewportHeight,
                maximumZoom: 1,
                selection,
                startsAtBottom: true,
                disableHorizontalMovement: true,
                viewportNeedsUpdate,
              }}
              // FlameGraphCanvas props
              chartProps={{
                thread,
                maxStackDepth,
                flameGraphTiming,
                callNodeInfo,
                stackFrameHeight: STACK_FRAME_HEIGHT,
                onSelectionChange: this._onSelectedCallNodeChange,
              }}
            />
          </div>
        </ContextMenuTrigger>
      </div>
    );
  }
}

// This function is given the FlameGraphCanvas's chartProps.
function viewportNeedsUpdate(
  prevProps: { +flameGraphTiming: FlameGraphTiming },
  newProps: { +flameGraphTiming: FlameGraphTiming }
) {
  return prevProps.flameGraphTiming !== newProps.flameGraphTiming;
}

const options: ExplicitConnectOptions<{||}, StateProps, DispatchProps> = {
  mapStateToProps: state => {
    const flameGraphTiming = selectedThreadSelectors.getFlameGraphTiming(state);

    return {
      thread: selectedThreadSelectors.getThread(state),
      maxStackDepth: selectedThreadSelectors.getCallNodeMaxDepthForFlameGraph(
        state
      ),
      flameGraphTiming,
      timeRange: getDisplayRange(state),
      selection: getProfileViewOptions(state).selection,
      threadName: selectedThreadSelectors.getFriendlyThreadName(state),
      processDetails: selectedThreadSelectors.getThreadProcessDetails(state),
      callNodeInfo: selectedThreadSelectors.getCallNodeInfo(state),
      threadIndex: getSelectedThreadIndex(state),
    };
  },
  mapDispatchToProps: {
    changeSelectedCallNode,
  },
  component: FlameGraph,
};
export default explicitConnect(options);
