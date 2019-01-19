/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow

import React from 'react';
import { filterCallNodePathByImplementation } from '../../profile-logic/transforms';
import {
  getOriginAnnotationForFunc,
  convertStackToCallNodePath,
} from '../../profile-logic/profile-data';

import type { Thread, IndexIntoStackTable } from '../../types/profile';
import type { ImplementationFilter } from '../../types/actions';

require('./Backtrace.css');

type Props = {|
  +thread: Thread,
  +maxHeight: string | number,
  +stackIndex: IndexIntoStackTable,
  +implementationFilter: ImplementationFilter,
|};

function Backtrace(props: Props) {
  const { stackIndex, thread, implementationFilter, maxHeight } = props;
  const { funcTable, stringTable } = thread;
  const callNodePath = filterCallNodePathByImplementation(
    thread,
    implementationFilter,
    convertStackToCallNodePath(thread, stackIndex)
  );

  return (
    <ol className="backtrace" style={{ '--max-height': maxHeight }}>
      {callNodePath.length > 0 ? (
        callNodePath.map((func, i) => (
          <li key={i} className="backtraceStackFrame">
            {stringTable.getString(funcTable.name[func])}
            <em className="backtraceStackFrameOrigin">
              {getOriginAnnotationForFunc(
                func,
                thread.funcTable,
                thread.resourceTable,
                thread.stringTable
              )}
            </em>
          </li>
        ))
      ) : (
        <li className="backtraceStackFrame">
          (stack empty or all stack frames filtered out)
        </li>
      )}
    </ol>
  );
}

export default Backtrace;
