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
    this.routes[method].push(route);
  }

  _processRoute(route, parent) {
    const handler = this._splitHandler(route.handler);

    // save the controller objects
    if (!this._controllers[handler.controllerName]) {
      const Controller = this._controllerClasses[handler.controllerName];
      if (!Controller) {
        throw Error('Controller not found: ' + handler.controllerName);
      }
      this._controllers[handler.controllerName] = new Controller();
    }

    const handlerMethod = this._controllers[handler.controllerName][handler.methodName];

    if (!handlerMethod) {
      throw Error('Controller method not found: ' + handler.controllerName + '.' + handler.methodName);
    }

    const params = paramHelper.parseParams(route.path);
    const routePath = parent ? parent.path + route.path : route.path;

    return {
      method: route.method.toUpperCase(),
      path: this._trimTrailingSlash(routePath),
      segments: this._getSegments(routePath),
      params: params,
      hasParams: !!params.length,
      handlerController: this._controllers[handler.controllerName],
      handler: handlerMethod,
      middleware: this._getRouteMiddleware(route),
    };
  }

  _getRouteMiddleware(route) {
    if (!route.middleware || !route.middleware.length) return null;

    const middleware = [];
    for (let i = 0, n = route.middleware.length; i < n; i++) {
      if (!this.middleware[route.middleware[i]]) {
        throw Error('Middleware not found: ' + route.middleware[i]);
        break;
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
