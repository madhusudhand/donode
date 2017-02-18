'use strict';
const headersHelper = require('./helpers/headers-helper');

class Headers {
  constructor() {
    this.headers = {};
  }

  register(headers) {
    headersHelper.validateHeaderDefinitions(headers || {});
    this.headers = headers;
  }

  __getHeaders(headerKey) {
    return this.headers[headerKey];
  }
}

module.exports = new Headers();
