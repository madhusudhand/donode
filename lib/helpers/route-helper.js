'use strict';

const path = require('path');
const exportFiles = require('export-files');
const paramHelper = require('./param-helper');
const errorHelper = require('./error-helper');

class RouteHelper {
  constructor() {
    // holds controller instances
    this._controllers = {};

    // holds controller classes
    this._controllerClasses = [];
  }

  collectRoutes(rawRoutes, middleware, options) {
    // init routes
    this.routes = {};
    this.middleware = middleware;

    this._controllerClasses = this._loadControllers(options.basePath);
    this._preprocess(rawRoutes);
    return this.routes;
  }

  _preprocess(rawRoutes, parent) {
    for (let i = 0, l = rawRoutes.length; i < l; i++) {
      // method is mandatory for a route.
      // if no method is specified, path will be considered prefix for children
      if (rawRoutes[i].method) {
        // route validation
        this._validateRoute(rawRoutes[i]);

        const processedRoute = this._processRoute(rawRoutes[i], parent);
        this._pushRoute(processedRoute);
      }

      if (Array.isArray(rawRoutes[i].children)) {
        this._preprocess(rawRoutes[i].children, rawRoutes[i]);
      }
    }
  }

  _validateRoute(route) {
    // path
    // REQUIRED
    if (!route.path) {
      errorHelper.throwError({
        error: `missing path.`,
        line : `Route { path: ${route.path}, method: ${route.method} }`,
        file : `routes.js`,
        hint : `add a 'path'.`
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
  }

  _pushRoute(route) {
    const method = route.method.toLowerCase();

    if (!Array.isArray(this.routes[method])) {
      this.routes[method] = [];
    }

    // check if similar route exists
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

    this.routes[method].push(route);
  }

  _processRoute(route, parent) {
    const handler = this._splitHandler(route.handler);

    // save the controller objects
    if (!this._controllers[handler.controllerName]) {
      const Controller = this._controllerClasses[handler.controllerName];
      if (!Controller) {
        errorHelper.throwError({
          error: `Controller '${handler.controllerName}' not found.`,
          line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
          file : `routes.js`,
          hint : `make sure Controller filename is same as given in handler; and is present inside app/controllers`
        });
      }
      this._controllers[handler.controllerName] = new Controller();
    }

    const handlerMethod = this._controllers[handler.controllerName][handler.methodName];

    if (!handlerMethod) {
      errorHelper.throwError({
        error: `handler method '${handler.methodName}' not found. [in ${handler.controllerName}]`,
        line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
        file : `routes.js`,
        hint : `add the handler method in controller`
      });
    }

    const params = paramHelper.parseParams(route.path);
    const routePath = parent ? parent.path + route.path : route.path;

    return {
      method: route.method.toUpperCase(),
      path: this._trimTrailingSlash(routePath),
      segments: this._getSegments(routePath),
      footprint: this._getRouteFootprint(routePath),
      params: params,
      hasParams: !!params.length,
      handlerController: this._controllers[handler.controllerName],
      handler: handlerMethod,
      middleware: this._getRouteMiddleware(route),
    };
  }

  _getRouteMiddleware(route) {
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

      // check if middleware exists
      if (!this.middleware[route.middleware[i]]) {
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

      middleware.push(this.middleware[route.middleware[i]]);
    }
    return middleware;
  }

  _trimTrailingSlash(routePath) {
    if (routePath[routePath.length-1] === '/') {
      return routePath.slice(0, -1);
    }
    return routePath;
  }

  _getRouteFootprint(routePath) {
    const segments = this._getSegments(routePath);
    return '/' + segments.map((s) => this._hasParams(s) ? '?' : s).join('/');
  }

  _getSegments(routePath) {
    return this._trimTrailingSlash(routePath).split('/').slice(1);
  }

  _hasParams(routePath) {
    return routePath.indexOf('{') > -1;
  }

  _splitHandler(handlerString) {
    const hs = handlerString.split('@');
    return {
      controllerName: hs[0],
      methodName: hs.length > 1 ? hs[1] : null
    };
  }

  _loadControllers(basePath) {
    return exportFiles(basePath);
  }
}

// singleton
module.exports = new RouteHelper();
