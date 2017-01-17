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

  // _preprocess() {
  //   // TODO: Avoid naming conflicts when loading from sub-directories
  //   for (let middlewareClassName in this._middlewareClasses) {
  //     const Middleware = this._middlewareClasses[middlewareClassName];
  //     console.log(typeof Middleware);
  //     // this.middleware[middlewareClassName] = new Middleware();
  //   }
  // }


  getRouteMiddleware(route) {
    if (!route.middleware || !route.middleware.length) return null;

    // check for dupes
    for (let m of route.middleware) {
      if (route.middleware.indexOf(m) !== route.middleware.lastIndexOf(m)) {
        errorHelper.throwWarning({
          error: `duplicate middleware '${m}' found.`,
          line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${route.middleware.join(', ')}] }`,
          file : `routes.js`
        });
        break;
      }
    }

    const middleware = [];
    for (let i = 0, n = route.middleware.length; i < n; i++) {

      const middlewareObj = this._getMiddlewareObject(route.middleware[i]);

      // check if middleware exists
      if (!middlewareObj) {
        errorHelper.throwError({
          error: `middleware '${route.middleware[i]}' not found.`,
          line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${route.middleware.join(', ')}] }`,
          file : `routes.js`,
          hint : [
            `make sure Middleware filename is same as given (case sensitive); and is present inside app/middleware`,
            `if the file is inside a sub-directory then prefix the path`,
            `app/middleware/user/Auth.js  ->  user/Auth`
          ]
        });
      }

      middleware.push(middlewareObj);
    }
    return middleware;
  }

  _getMiddlewareObject(middleware) {
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

}

// singleton
module.exports = new MiddlewareHelper();
