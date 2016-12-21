'use strict';

const path = require('path');
const exportFiles = require('export-files');
const paramHelper = require('./param-helper');

class RouteHelper {
  constructor() {
    this._controllers = {};
    this._controllerClasses = [];
  }

  getRoutes(rawRoutes, options) {
    this._loadControllers(options.appRoot);

    const routes = {
      plainRoutes: {},
      paramRoutes: {}
    };

    for (let route of rawRoutes) {
      const processedRoute = this._processRoute(route);

      // NOTE: Refactor
      if (this._doesContainsParams(route.path)) {
        if (!routes.paramRoutes[route.path]) {
          routes.paramRoutes[route.path] = [];
        }
        routes.paramRoutes[route.path].push(processedRoute);
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
    const h = this._splitHandler(route.handler);
    // save the controller objects
    if (!this._controllers[h[0]]) {
      const Controller = this._controllerClasses[h[0]];

      if (!Controller) {
        throw Error('Controller not found: ' + h[0]);
      }

      const cObj = new Controller();
      this._controllers[h[0]] = cObj;
    }

    const handlerMethod = this._controllers[h[0]][h[1]];

    if (!handlerMethod) {
      throw Error('Controller method not found: ' + h[0]+'.'+h[1]);
    }

    return {
      method: route.method,
      routeUrl: route.path,
      params: paramHelper.parseParams(route.path),
      handlerController: this._controllers[h[0]],
      handlerMethod: handlerMethod
    };
  }

  _doesContainsParams(routeString) {
    return routeString.indexOf('{') > -1;
  }

  _splitHandler(handlerString) {
    return handlerString.split('@');
  }

  _loadControllers(appRoot) {
    this._controllerClasses = exportFiles(path.join(appRoot, 'app', 'controllers'));
  }
}

module.exports = RouteHelper;
