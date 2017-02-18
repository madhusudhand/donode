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
  }

  collectRoutes(rawRoutes, options) {
    // init routes
    this.routes = {};

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

        // attach parent
        rawRoutes[i].parent = parent;

        const processedRoute = this._processRoute(rawRoutes[i]);
        this._pushRoute(processedRoute);
      }

      if (Array.isArray(rawRoutes[i].children)) {
        this._preprocess(rawRoutes[i].children, rawRoutes[i]);
      }
    }
  }

  _validateRoute(route) {
    // TODO: move these validations to respctive helpers

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

    // HEADERS [OPTIONAL]
    headersHelper.validateRouteHeaders(appHeaders, route);
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

  _processRoute(route) {
    const handler = this._splitHandler(route.handler);
    const controllerKey = handler.controllerPath + '/' + handler.controllerName;

    // save the controller objects
    if (!this._controllers[controllerKey]) {
      let ctrlObj = null;

      if (handler.controllerPath) {
        for (let key of handler.controllerPath.split(path.delimiter)) {
          ctrlObj = this._controllerClasses[key];

          // path not found
          if (!ctrlObj) {
            errorHelper.throwError({
              error: `Controller '${handler.controllerName}' not found in the path app/controllers/${handler.controllerPath}.`,
              line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
              file : `routes.js`,
              hint : `make sure Controller path is correct (case sensitive) and is present inside app/controllers`
            });
          }
        }
      } else {
        ctrlObj = this._controllerClasses;
      }

      const ControllerClass = ctrlObj[handler.controllerName];

      if (!ControllerClass) {
        errorHelper.throwError({
          error: `Controller '${handler.controllerName}' not found.`,
          line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
          file : `routes.js`,
          hint : `make sure Controller filename is same as given in handler; and is present inside app/controllers`
        });
      }
      this._controllers[controllerKey] = new ControllerClass();
    }

    const handlerMethod = this._controllers[controllerKey][handler.methodName];

    if (!handlerMethod) {
      errorHelper.throwError({
        error: `handler method '${handler.methodName}' not found. [in ${handler.controllerName}]`,
        line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
        file : `routes.js`,
        hint : `add the handler method in controller`
      });
    }

    const params = paramHelper.parseParams(route.path);
    const routePath = this._getFullRoutePath(route);

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

  _getFullRoutePath(route) {
    if (!route) return '';

    if (route.parent) {
      return this._getFullRoutePath(route.parent) + route.path;
    }

    return route.path;
  }

  _trimTrailingSlash(routePath) {
    if (routePath.length > 1 && routePath[routePath.length-1] === '/') {
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
    const controllerName = path.basename(hs[0]);
    let controllerPath = path.dirname(hs[0]) || '';
    if (controllerPath[0] === '.') {
      controllerPath = '';
    }

    return {
      controllerName: controllerName,
      controllerPath: controllerPath,
      methodName: hs.length > 1 ? hs[1] : null
    };
  }

  _loadControllers(basePath) {
    return requireDir(module, basePath);
  }
}

// singleton
module.exports = new RouteHelper();
