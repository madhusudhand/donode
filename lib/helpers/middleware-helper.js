'use strict';

const path = require('path');
const requireDir = require('require-directory');
const errorHelper = require('./error-helper');

class MiddlewareHelper {
  constructor() {
    // holds middleware classes
    this._middlewareClasses = [];
    // holds middleware instances
    this._middleware = {};
  }

  requireMiddleware(options) {
    this._middlewareClasses = requireDir(module, options.basePath);
  }

  getRouteMiddleware(route) {
    // no middleware defined
    if (!route.middleware) return null;

    // is array?
    if (Array.isArray(route.middleware)) {
      return (route.middleware.length === 0) ? null : this._getMiddlewareObjects(route, route.middleware);
    }

    // is object?
    if (typeof route.middleware !== 'object') {
      showError();
    }

    // it is object syntax
    // collect middleware
    let middleware = [];

    if (route.middleware.all) {
      if (!Array.isArray(route.middleware.all)) {
        showError();
      }

      middleware = middleware.concat(route.middleware.all);
    }

    if (route.middleware.current) {
      if (!Array.isArray(route.middleware.current)) {
        showError();
      }

      middleware = middleware.concat(route.middleware.current);
    }

    // get parent middleware
    return this._getMiddlewareObjects(route, middleware);


    function showError() {
      errorHelper.throwError({
        error: `invalid value for middleware.`,
        line : `Route: { path: '${route.path}', method: '${route.method}', middleware: '${route.middleware}' }`,
        file : `routes.js`,
        hint : `give an Array or Object for middleware`
      });
    }

  }


  _getMiddlewareObjects(route, middleware) {

    // check for dupes
    this._checkForDupes(middleware);

    const middlewareObjects = [];
    for (let i = 0, n = middleware.length; i < n; i++) {

      const middlewareObj = this._getSingleMiddlewareObject(middleware[i]);

      // check if middleware exists
      if (!middlewareObj) {
        errorHelper.throwError({
          error: `middleware '${middleware[i]}' not found.`,
          line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${middleware.join(', ')}] }`,
          file : `routes.js`,
          hint : [
            `make sure Middleware filename is same as given (case sensitive); and is present inside app/middleware`,
            `if the file is inside a sub-directory then prefix the path`,
            `app/middleware/user/Auth.js  ->  user/Auth`
          ]
        });
      }

      middlewareObjects.push(middlewareObj);
    }
    return middlewareObjects;
  }


  _getSingleMiddlewareObject(middleware) {
    if (this._middleware[middleware]) return this._middleware[middleware];

    const middlewareName = path.basename(middleware);
    let middlewarePath = path.dirname(middleware);
    if (middlewarePath === '.') {
      middlewarePath = '';
    }

    let mObj = null;

    if (middlewarePath) {
      for (let key of middlewarePath.split(path.delimiter)) {
        mObj = this._middlewareClasses[key];

        // path not found
        if (!mObj) {
          errorHelper.throwError({
            error: `Middleware '${middlewareName}' not found in the path app/middleware/${middlewarePath}.`,
            line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${route.middleware.join(', ')}] }`,
            file : `routes.js`,
            hint : `make sure Middleware path is correct (case sensitive) and is present inside app/middleware`
          });
        }
      }
    } else {
      mObj = this._middlewareClasses;
    }

    const MiddlewareClass = mObj[middlewareName];

    if (!MiddlewareClass) {
      return null;
    }

    this._middleware[middleware] = new MiddlewareClass();
    return this._middleware[middleware];
  }

  _checkForDupes(middleware) {
    // check for dupes
    for (let m of middleware) {
      if (middleware.indexOf(m) !== middleware.lastIndexOf(m)) {
        errorHelper.throwWarning({
          error: `duplicate middleware '${m}' found.`,
          line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${route.middleware.join(', ')}] }`,
          file : `routes.js`
        });
      }
    }
  }

}

// singleton
module.exports = new MiddlewareHelper();
