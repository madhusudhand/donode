'use strict';
const headersHelper = require('./helpers/headers-helper');

class Headers {
  constructor() {
    this.headerGroups = {};
  }

  /*
  **       on: BOOTSTRAP
  **
  **  register the list of header groups which can be configured for a route
  **
  **  inputs
  **    - header groups
  */
  collect(headerGroups, config) {
    // skip validations in prod
    if (!config.production) {
      headersHelper.validateHeaderDefinitions(headerGroups || {});
    }

    this.headerGroups = headerGroups;
  }

  /*
  **       on: REQUEST
  **
  **  return a single header group for the given key
  **
  **  inputs
  **    - header group name
  */
  __getHeaders(headerGroupName) {
    return this.headerGroups[headerGroupName];
  }
}

module.exports = new Headers();
