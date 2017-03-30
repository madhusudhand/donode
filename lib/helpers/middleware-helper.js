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

    this._appConfig = {};
  }

  /*
  **       on: BOOTSTRAP
  **
  **  Load middleware files from the given path
  */
  requireMiddleware(config) {
    this._appConfig = config;
    this._middlewareClasses = requireDir(module,
                                         config.middlewarePath,
                                         { exclude: path => (/\.test\.js$/.test(path)) }
                                        );
  }

  /*
  **       on: BOOTSTRAP
  **
  **  Returns flat list of middleware for a given route
  */
  getRouteMiddleware(route) {
    // validate route middleware object
    this._validateMiddleware(route);

    // collect middleware from parent hierarchy
    let middleware = this._collectParentMiddleware(route.parent);

    // append current route middleware
    middleware = middleware.concat(route.middleware.all).concat(route.middleware.current);

    // check for dupes
    const dupes = this._checkForDupes(middleware);
    if (dupes) {
      errorHelper.throwWarning({
        warning : `duplicate middleware '${dupes}' found.`,
        line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${middleware.join(', ')}] }`,
        file : `routes.js`
      });
    }

    // return along with middleware classes
    return middleware.map((m) => this._getMiddlewareClass(route, m));
  }


  /*
  **       on: BOOTSTRAP
  **
  **  Validate the middleware object
  */
  _validateMiddleware(route) {
    if (!route.middleware) {
      route.middleware = { all: [], current: [], children: [] };
      return;
    }

    if (Array.isArray(route.middleware)) { // is array?
      // by default it is attached to current route only.
      route.middleware = { all: [], current: route.middleware, children: [] };

    } else if (typeof route.middleware === 'object') { // is object?

      // fill empty if not defined.
      route.middleware.all = route.middleware.all || [];
      route.middleware.current = route.middleware.current || [];
      route.middleware.children = route.middleware.children || [];

      // validate if all, current, children are arrays
      if (
        !Array.isArray(route.middleware.all) ||
        !Array.isArray(route.middleware.current) ||
        !Array.isArray(route.middleware.children)
      ) {
        // show error
        _showError();
      }
    } else {
      // show eror
      _showError();
    }


    function _showError() {
      errorHelper.throwError({
        error: `Not a valid value for middleware.`,
        line : `Route: { path: '${route.path}', method: '${route.method}', middleware: '${route.middleware}' }`,
        file : `routes.js`,
        hint : `give an Array or Object`
      });
    }
  }

  /*
  **       on: BOOTSTRAP
  **
  **  Recursively collect all middleware from parent hierarchy
  */
  _collectParentMiddleware(route) {
    if (!route) return [];

    this._validateMiddleware(route);

    if (route.parent) {
      return [].concat(this._collectParentMiddleware(route.parent), collect());
    }

    return collect();

    function collect() {
      return [].concat(route.middleware.all).concat(route.middleware.children);
    }
  }


  /*
  **       on: BOOTSTRAP
  **
  **  fetch the corresponding class
  */
  _getMiddlewareClass(route, middleware) {
    // check if cached
    if (this._middleware[middleware]) {
      return this._middleware[middleware];
    }

    const middlewareName = path.basename(middleware);
    let middlewarePath = path.dirname(middleware);
    if (middlewarePath === '.') {
      middlewarePath = '';
    }

    let middlewareClasses = null;

    if (middlewarePath) {
      for (let key of middlewarePath.split(path.delimiter)) {
        middlewareClasses = this._middlewareClasses[key];

        // path not found
        if (!middlewareClasses) {
          errorHelper.throwError({
            error: `Middleware '${middlewareName}' not found in the path app/middleware/${middlewarePath}.`,
            line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${route.middleware.join(', ')}] }`,
            file : `routes.js`,
            hint : `make sure Middleware path is correct (case sensitive) and is present inside app/middleware`
          });
        }
      }
    } else {
      middlewareClasses = this._middlewareClasses;
    }

    const MiddlewareClass = middlewareClasses[middlewareName];

    if (!MiddlewareClass) {
      errorHelper.throwError({
        error: `middleware '${middlewareName}' not found.`,
        line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${middlewareName}] }`,
        file : `routes.js`,
        hint : [
          `make sure Middleware filename is same as given (case sensitive); and is present inside app/middleware`,
          `if the file is inside a sub-directory then prefix the path`,
          `app/middleware/user/Auth.js  ->  user/Auth`
        ]
      });
    }

    // check if object is valid class or not
    if (typeof MiddlewareClass !== 'function') {
      errorHelper.throwError({
        error: `Middleware '${middlewareName}' is not a 'Class' or 'module.exports' is missing in the file.`,
        line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${middleware}] }`,
        file : `${path.join(this._appConfig.relMiddlewarePath, middleware)}.js`,
        hint : `A middleware is a class and should be exported. check if module.exports = ClassName; is missing.`
      });
    }

    // check if 'handle method defined'
    if (typeof MiddlewareClass.prototype.handle !== 'function') {
      errorHelper.throwError({
        error: `method 'handle' not defined in '${middlewareName}'`,
        line : `Route: { path: ${route.path}, method: ${route.method}, middleware: [${middleware}] }`,
        file : `${path.join(this._appConfig.relMiddlewarePath, middleware)}.js`,
        hint : `add the method named 'handle' in middleware class.`
      });
    }

    // cache
    this._middleware[middleware] = MiddlewareClass;
    return this._middleware[middleware];
  }




  _checkForDupes(middleware) {
    // check for dupes
    for (let m of middleware) {
      if (middleware.indexOf(m) !== middleware.lastIndexOf(m)) {
        return m;
      }
    }
    return '';
  }

}

// singleton
module.exports = new MiddlewareHelper();
