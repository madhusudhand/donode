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
  register(headerGroups) {
    headersHelper.validateHeaderDefinitions(headerGroups || {});
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
