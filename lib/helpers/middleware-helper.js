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

    let middleware = [];

    if (Array.isArray(route.middleware)) { // is array?
      middleware = route.middleware;
    } else if (typeof route.middleware === 'object') { // is object?
      // collect current route middleware
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
    } else {
      // not arry or object
      // invalid syntax
      showError();
    }


    // collect middleware from parent chain
    middleware = [].concat(this._getParentMiddleware(route.parent)).concat(middleware);

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

  _getParentMiddleware(route) {
    if (!route) return [];

    if (route.parent) {
      return [].concat(this._getParentMiddleware(route.parent), collect());
    }

    return collect();

    function collect() {
      if (!route.middleware) return [];
      if (Array.isArray(route.middleware)) return route.middleware;
      if (typeof route.middleware === 'object') {
        if (route.middleware.children && Array.isArray(route.middleware.children))
          return route.middleware.children;
      }

      return [];
    }
  }


  _getMiddlewareObjects(route, middleware) {

    // check for dupes
    const dupes = this._checkForDupes(middleware);
    if (dupes) {
      errorHelper.throwWarning({
        error: `duplicate middleware '${dupes}' found.`,
        line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${middleware.join(', ')}] }`,
        file : `routes.js`
      });
    }

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
        return m;
      }
    }

    return false;
  }

}

// singleton
module.exports = new MiddlewareHelper();
