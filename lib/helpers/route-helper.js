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

  processRoutes(rawRoutes, options) {
    this._controllerClasses = this._loadControllers(options.appRoot);

    const routes = {
      plainRoutes: {}, //   /hello/world
      mixedRoutes: {}  //   /hello/{id}/hi
    };

    for (let route of rawRoutes) {
      const processedRoute = this._processRoute(route);

      // NOTE: Refactor
      if (this._doesContainsParams(route.path)) {
        if (!routes.mixedRoutes[route.path]) {
          routes.mixedRoutes[route.path] = [];
        }
        routes.mixedRoutes[route.path].push(processedRoute);
      } else {
        if (!routes.plainRoutes[route.path]) {
          routes.plainRoutes[route.path] = [];
        }
        routes.plainRoutes[route.path].push(processedRoute);
      }

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

    return {
      method: route.method,
      path: route.path,
      params: paramHelper.parseParams(route.path),
      handlerController: this._controllers[handler.controllerName],
      handler: handlerMethod
    };
  }

  _doesContainsParams(routeString) {
    return routeString.indexOf('{') > -1;
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

module.exports = RouteHelper;
