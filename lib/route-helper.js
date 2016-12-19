'use strict';

const path = require('path');
const exportFiles = require('export-files');

class RouteHelper {
  constructor() {
    this._controllers = {};
    this._controllerClasses = [];
  }

  getRoutes(rawRoutes, options) {
    this._loadControllers(options.appRoot);

    const routes = {};
    for (let route of rawRoutes) {
      const processedRoute = this._processRoute(route);
      if (!routes[route.route]) {
        routes[route.route] = [];
      }
      routes[route.route].push(processedRoute);
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
      routeUrl: route.route,
      handlerController: this._controllers[h[0]],
      handlerMethod: handlerMethod
    };
  }

  _splitHandler(handlerString) {
    return handlerString.split('@');
  }

  _loadControllers(appRoot) {
    this._controllerClasses = exportFiles(path.join(appRoot, 'app', 'controllers'));
  }
}

module.exports = RouteHelper;
