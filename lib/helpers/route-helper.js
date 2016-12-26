'use strict';

const path = require('path');
const exportFiles = require('export-files');
const paramHelper = require('./param-helper');
const constants = require('./constants');

class RouteHelper {
  constructor() {
    // holds controller instances
    this._controllers = {};

    // holds controller classes
    this._controllerClasses = [];
  }

  processRoutes(rawRoutes, options) {
    this._controllerClasses = this._loadControllers(options.appRoot);

    const routes = {};

    for (let route of rawRoutes) {
      const processedRoute = this._processRoute(route);
      const httpMethod = processedRoute.method.toLowerCase();
      
      if (!Array.isArray(routes[httpMethod])) {
        routes[httpMethod] = [];
      }
      routes[httpMethod].push(processedRoute);
    }
    return routes;
  }


  _processRoute(route) {
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

    return {
      method: route.method,
      path: route.path,
      segments: this._getSegments(route.path),
      params: params,
      hasParams: !!params.length,
      handlerController: this._controllers[handler.controllerName],
      handler: handlerMethod
    };
  }

  _getSegments(routePath) {
    return routePath.split('/').slice(1);
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
