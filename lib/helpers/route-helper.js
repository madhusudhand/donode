'use strict';

const path = require('path');
const requireDir = require('require-directory');
const paramHelper = require('./param-helper');
const errorHelper = require('./error-helper');
const middlewareHelper = require('./middleware-helper');
const headersHelper = require('./headers-helper');
const appHeaders = require('../headers');

class RouteHelper {
  constructor() {
    // holds controller classes
    this._controllerClasses = [];
    // holds controller instances
    this._controllers = {};

    // app config
    this._appConfig = {};
  }

  /*
  **       on: BOOTSTRAP
  **
  **  validates the given route config
  **
  **  inputs
  **    - route config
  **      - [ of objects ]
  */
  validateRouteConfig(routeConfig) {
    if (!Array.isArray(routeConfig)) {
      errorHelper.throwError({
        error: 'not a valid route list.',
        line : 'router.routes() takes an array objects',
        file : 'routes.js',
        hint : 'should be array of objects.'
      });
    }
  }

  /*
  **       on: BOOTSTRAP
  **
  **  collect all routes of the app based on the given route config
  **
  **  inputs
  **    - route config
  **    - options
  **
  **  returns
  **    - list of processed routes
  */
  collectRoutes(routeConfig, options) {
    // init routes
    this.routes = {};
    this._appConfig = options;

    // collect all controllers from the given controllerDir
    this._controllerClasses = requireDir(module,
                                         this._appConfig.controllerPath,
                                         { exclude: path => (/\.test\.js$/.test(path)) }
                                        );

    this._processRouteConfig(routeConfig);
    return this.routes;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  recursive call process each route config item
  **
  */
  _processRouteConfig(routeConfig, parent) {

    for (let route of routeConfig) {
      // "method" property is mandatory to consider it as a valid route.
      // if no method is specified, its path will be considered prefix for children
      if (route.method) {
        // validate in dev mode
        if (!this._appConfig.envConfig.production) {
          this._validateRoute(route);
        }

        // attach parent
        route.parent = parent;
        this._pushRoute(this._processRoute(route));
      }

      // if the route has children, make a recursive call
      if (Array.isArray(route.children)) {
        this._processRouteConfig(route.children, route);
      }
    }

  }

  /*
  **       on: BOOTSTRAP
  **
  **  process a given route
  **
  */
  _processRoute(route) {
    // split the handler string "path/ControllerName@methodName"
    const handler = this._splitHandler(route.handler);
    const controllerKey = path.join(handler.controllerPath, handler.controllerName);

    // check if the controller has already validated.
    if (!this._controllers[controllerKey]) {
      let ctrlClasses = null;

      // if the controller prefixed with some path
      if (handler.controllerPath) {
        // TODO: test this split function in different OS
        for (let key of handler.controllerPath.split(path.delimiter)) {
          ctrlClasses = this._controllerClasses[key];

          // controller path is not found
          if (!ctrlClasses) {
            errorHelper.throwError({
              error: `directory '${handler.controllerPath}' not found in '${this._appConfig.relControllerPath}'`,
              line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
              file : `routes.js`,
              hint : `make sure path is correct (case sensitive) and is present in ${this._appConfig.relControllerPath}`
            });
          }
        }
      } else {
        ctrlClasses = this._controllerClasses;
      }

      const ControllerClass = ctrlClasses[handler.controllerName];

      // validate in dev mode
      if (!this._appConfig.envConfig.production) {
        // controller doesn't exists in the given controller path
        if (!ControllerClass) {
          errorHelper.throwError({
            error: `Controller '${handler.controllerName}' not found.`,
            line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
            file : `routes.js`,
            hint : [`make sure Controller exists in ${path.join(this._appConfig.relControllerPath, handler.controllerPath)}.`,
                    `'filename' should be same as controller (case sensitive).`]
          });
        }

        // file exists but not exporting a class
        if (typeof ControllerClass !== 'function') {
          errorHelper.throwError({
            error: `Controller '${handler.controllerName}' is not a 'Class' or 'module.exports' is missing in the file.`,
            line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
            file : `${path.join(this._appConfig.relControllerPath, controllerKey)}.js`,
            hint : `A controller is a class and should be exported. check if module.exports = ClassName; is missing.`
          });
        }

        // method not defined in the controller
        if (typeof ControllerClass.prototype[handler.methodName] !== 'function') {
          errorHelper.throwError({
            error: `handler method '${handler.methodName}' not defined in '${handler.controllerName}'`,
            line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
            file : `${path.join(this._appConfig.relControllerPath, controllerKey)}.js`,
            hint : `add the method in controller.`
          });
        }
      }

      // cache the controller.
      this._controllers[controllerKey] = ControllerClass;
    }

    // route params
    const params = paramHelper.parseParams(route.path);
    const routePath = this._getRoutePath(route);

    return {
      method: route.method.toUpperCase(),
      path: this._trimTrailingSlash(routePath),
      segments: this._getSegments(routePath),
      footprint: this._getRouteFootprint(routePath),
      params: params,
      hasParams: !!params.length,

      controller: this._controllers[controllerKey],
      handle: handler.methodName,
      middleware: middlewareHelper.getRouteMiddleware(route),
      headers: headersHelper.getHeaders(appHeaders, route.headers),
    };
  }

  /*
  **       on: BOOTSTRAP
  **
  **  validate a given route configuration
  **
  */
  _validateRoute(route) {
    // path
    // REQUIRED
    if (!route.path) {
      errorHelper.throwError({
        error: `missing path.`,
        line : `Route { path: ${route.path}, method: ${route.method} }`,
        file : `routes.js`,
        hint : `add a 'path' property.`
      });
    }

    // Should start with /
    if (route.path.slice(0, 1) !== '/') {
      errorHelper.throwError({
        error: `path should start with '/'`,
        line : `Route { path: ${route.path}, method: ${route.method} }`,
        file : `routes.js`,
        hint : `prepend '/' to the path.`
      });
    }

    // handler
    // REQUIRED
    if (!route.handler) {
      errorHelper.throwError({
        error: `missing handler.`,
        line : `Route { path: ${route.path}, method: ${route.method} }`,
        file : `routes.js`,
        hint : `add a 'handler' (or) remove 'method' property, if the 'path' is prefix for child routes.`
      });
    }

    // FORMAT
    const index = route.handler.indexOf('@');
    if (index === -1 || index === route.handler.length-1) {
      errorHelper.throwError({
        error: `invalid format for 'handler'.`,
        line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
        file : `routes.js`,
        hint : `valid format - SomeController@method`
      });
    }

    // HEADERS [OPTIONAL]
    headersHelper.validateRouteHeaders(appHeaders, route);
  }


  /*
  **       on: BOOTSTRAP
  **
  **  push the processed route to the app route list
  **  check for the conflicts if any
  */
  _pushRoute(route) {
    const method = route.method.toLowerCase();

    if (!Array.isArray(this.routes[method])) {
      this.routes[method] = [];
    }

    // check if similar route exists (dev mode)
    if (!this._appConfig.envConfig.production) {
      for (let _route of this.routes[method]) {
        if (_route.footprint === route.footprint) {
          errorHelper.throwError({
            error: `route conflict.`,
            line : [
              `following routes appears either same or conflicting.`,
              `Route 1: { path: ${route.path}, method: ${route.method} }`,
              `Route 2: { path: ${_route.path}, method: ${_route.method} }`
            ],
            file : `routes.js`,
            hint : `a route must be unique by its 'path' and 'method'`
          });
        }
      }
    }

    this.routes[method].push(route);
  }


  /*
  **       on: BOOTSTRAP
  **
  **  traverse though the parent hierarchy to fetch complete route path
  **
  */
  _getRoutePath(route) {
    if (!route) return '';
    return route.parent ? (this._getRoutePath(route.parent) + route.path) : route.path;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  traverse though the parent hierarchy to fetch complete route path
  **
  */
  _trimTrailingSlash(routePath) {
    return (routePath.length > 1 && routePath[routePath.length-1] === '/')
         ? routePath.slice(0, -1) : routePath;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  get the route footprint
  **  replace route params with "?"
  */
  _getRouteFootprint(routePath) {
    const segments = this._getSegments(routePath);
    return '/' + segments.map((s) => this._hasParams(s) ? '?' : s).join('/');
  }

  /*
  **       on: BOOTSTRAP
  **
  **  get the segemnts of the route with "/" separator
  */
  _getSegments(routePath) {
    return this._trimTrailingSlash(routePath).split('/').slice(1);
  }

  /*
  **       on: BOOTSTRAP
  **
  **  check if the route has params
  */
  _hasParams(routePath) {
    return routePath.indexOf('{') > -1;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  split the route handler string
  **  inputs
  **    - handler string  -> "path/to/ControllerName@methodName"
  */
  _splitHandler(handlerString) {
    const hs = handlerString.split('@');
    const controllerName = path.basename(hs[0]);
    let controllerPath = path.dirname(hs[0]) || '';
    if (controllerPath.charAt(0) === '.') {
      controllerPath = '';
    }

    return {
      controllerName: controllerName,
      controllerPath: controllerPath,
      methodName: hs.length > 1 ? hs[1] : null
    };
  }

}

// singleton
module.exports = new RouteHelper();
