/*
   What is a SCOPE file. See documentation here:
   https://github.com/OpusCapita/react-showroom-client/blob/master/docs/scope-component.md
*/

import React, { Component, PropTypes } from 'react';
import { showroomScopeDecorator } from '@opuscapita/react-showroom-client';

@showroomScopeDecorator
export default
class NoFilesFoundStubScope extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        {this._renderChildren()}
      </div>
    );
  }
}

NoFilesFoundStubScope.contextTypes = {
  i18n: PropTypes.object
};
NoFilesFoundStubScope.childContextTypes = {
  i18n: PropTypes.object
};
