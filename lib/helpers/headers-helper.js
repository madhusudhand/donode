'use strict';
const errorHelper = require('./error-helper');

class HeadersHelper {
  constructor() {}

  /*
  **       on: BOOTSTRAP
  **
  **  validate the headers which are registered through headers.js
  **  valid values
  **    { }
  **    { key: {name, value} }
  **    { key: [ {name, value} ] }
  */
  validateHeaderDefinitions(headers) {
    // root value should be an object and (not NULL or ARRAY)
    if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
      errorHelper.throwError({
        error: 'Not a valid value for headers.',
        line : 'headers.register() takes an object',
        file : 'headers.js',
        hint : 'should be an object.'
      });
    }

    // validate each item
    for (let key in headers) {
      // each value should be an object or array
      if ( !headers[key] || typeof headers[key] !== 'object' ) {
        errorHelper.throwError({
          error: 'Not a valid value for header.',
          line : `'${key}': '${JSON.stringify(headers[key], null, 2)}'`,
          file : 'headers.js',
          hint : `header should be of the form -> 'content-json': { name: 'Content-Type', value: 'application/json;' }`
        });
      }

      // convert to an array if the value is an object
      // though it takes an OBJECT by syntax, always make it an ARRAY
      if (!Array.isArray(headers[key])) {
        headers[key] = [].concat(headers[key]);
      }

      // validate if it has the proper key value pair for the header
      // should be {name, value}
      for (let header of headers[key]) {
        if (!header || typeof header !== 'object' || !header.hasOwnProperty('name') || !header.hasOwnProperty('value')) {
          errorHelper.throwError({
            error: 'Not a valid value for header.',
            line : `'${key}': '${JSON.stringify(headers[key], null, 2)}'`,
            file : 'headers.js',
            hint : [`should be of the form -> 'content-json': { name: 'Content-Type', value: 'application/json;' }`,
                    `                          or`,
                    `                         'content-json': [ { name: 'Content-Type', value: 'application/json;' } ]`]
          });
        }
      }

    }
  }





  /*
  **       on: BOOTSTRAP
  **
  **  check if the headers specified in routes are valid
  **  valid scenarios for "headers" property
  **    - is optional
  **    - an array [ of strings ]
  **    - an object
  **        {
  **          all:      [ of strings ],
  **          current:  [ of strings ],
  **          children: [ of strings ]
  **        }
  */
  validateRouteHeaders(appHeaders, route) {
    // optional
    if (!route.headers) return;

    // check if it is an array
    if (!Array.isArray(route.headers)) {
      errorHelper.throwError({
        error: `Not a valid value for headers.`,
        line : `Route: { path: ${route.path}, method: ${route.method} }`,
        file : `routes.js`,
        hint : `value should be an 'array of strings' and are from headers.js`
      });
    }

    // check if headers registered in headers.js
    for (let header of route.headers) {
      if (!appHeaders.__getHeaders(header)) {
        errorHelper.throwError({
          error: `header '${header}' not defined in headers.js`,
          line : `Route: { path: ${route.path}, method: ${route.method}, headers: [${route.headers.join(', ')}] }`,
          file : `routes.js`,
          hint : `Header should be defined in 'headers.js' before using`
        });
      }
    }

  }



  /*
  **       on: BOOTSTRAP
  **
  **  Make sure this always returns an array
  **  either empty or flat list of objects {}
  */
  getHeaders(appHeaders, headerKeys) {
    // route should accept an array
    if (!Array.isArray(headerKeys)) return [];
    return this._flatMap(headerKeys, (key) => appHeaders.__getHeaders(key));
  }



  /*
  **  PRIVATE
  */
  _flatMap(arr, lambda) {
    return Array.prototype.concat.apply([], arr.map(lambda));
  }

}

// singleton
module.exports = new HeadersHelper();
