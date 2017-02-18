'use strict';
const errorHelper = require('./helpers/error-helper');

class Headers {
  constructor() {
    this.headers = {};
  }

  register(headers) {
    this._validate(headers);
    this.headers = headers;
  }

  __getHeader(headerKey) {
    return this.headers[headerKey];
  }

  _validate(headers) {
    if (!headers || typeof headers !== 'object') {
      errorHelper.throwError({
        error: 'not a valid values for headers.',
        line : 'headers.register() takes an object',
        file : 'headers.js',
        hint : 'should be an object.'
      });
    }

    for (let key in headers) {
      if (!headers[key] || typeof headers[key] !== 'object' || !headers[key].hasOwnProperty('name') || !headers[key].hasOwnProperty('value')) {
        errorHelper.throwError({
          error: 'not a valid values for header.',
          line : `'${key}': '${JSON.stringify(headers[key])}'`,
          file : 'headers.js',
          hint : `header should be of the form -> 'content-json': { name: 'Content-Type', value: 'application/json;' }`
        });
      }

      // TODO: add more validations such as object structure matches with name and value for headers
    }
  }
}

module.exports = new Headers();
