'use strict';
const errorHelper = require('./error-helper');
const appHeaders = require('../headers');

class HeadersHelper {
  constructor() {
  }

  validateHeaders(route) {
    if (!route.headers) return;

    if (!Array.isArray(route.headers)) {
      errorHelper.throwError({
        error: `invalid value for headers: '${JSON.stringify(route.headers)}'`,
        line : `Route: { path: ${route.path}, method: ${route.method} }`,
        file : `routes.js`,
        hint : `value should be an 'array of strings' and these 'strings' should be defined in headers.js`
      });
    }

    this.checkIfHeadersDefined(route);
  }

  checkIfHeadersDefined(route) {
    if (!route.headers) return;

    for (let header of route.headers) {
      if (!appHeaders.__getHeader(header)) {
        errorHelper.throwError({
          error: `header '${header}' not defined in headers.js`,
          line : `Route: { path: ${route.path}, method: ${route.method}, headers: [${route.headers.join(', ')}] }`,
          file : `routes.js`,
          hint : `Header should be defined in 'headers.js' before using`
        });
      }
    }
  }

  getHeader(headerKey) {
    return appHeaders.__getHeader(headerKey);
  }

  getHeaders(headerKeys) {
    if (!Array.isArray(headerKeys)) return [];
    return headerKeys.map((key) => this.getHeader(key));
  }
}

// singleton
module.exports = new HeadersHelper();
