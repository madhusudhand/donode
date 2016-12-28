'use strict';

const path = require('path');
const exportFiles = require('export-files');
const paramHelper = require('./param-helper');

class RouteHelper {
  constructor() {
    // holds controller instances
    this._controllers = {};

    // holds controller classes
    this._controllerClasses = [];
  }

  collectRoutes(rawRoutes, options) {
    // init routes
    this.routes = {};

    this._controllerClasses = this._loadControllers(options.appRoot);
    this._processRoutes(rawRoutes);
    return this.routes;
  }

  _preprocess(rawRoutes, parent) {
    for (let route of rawRoutes) {
      const processedRoute = this._processRoute(route, parent);
      this._pushRoute(processedRoute);

      if (Array.isArray(route.children)) {
        this._preprocess(route.children, route);
      }
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
      handler: handlerMethod
    };
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

  _loadControllers(appRoot) {
    // controller path is static as per the current implementation
    return exportFiles(path.join(appRoot, 'app', 'controllers'));
  }
}

// singleton
module.exports = new RouteHelper();
