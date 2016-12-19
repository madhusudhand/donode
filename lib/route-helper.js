'use strict';

const path = require('path');
const exportFiles = require('export-files');

class RouteHelper {
  constructor() {
    this._controllers = [];
    this._controllerClasses = [];
  }

  getRoutes(rawRoutes, options) {
    this._loadControllers(options.appRoot);

    const routes = {};
    for (let route of rawRoutes) {
      routes[route.route] = this._processRoute(route);
    }
    return routes;
  }


  _processRoute(route) {
    const h = this._splitHandler(route.handler);
    const Controller = this._controllerClasses[h[0]];

    if (!Controller) {
      throw Error('Controller not found: ' + h[0]);
    }

    const cObj = new Controller();
    const handlerMethod = cObj[h[1]];

    if (!handlerMethod) {
      throw Error('Controller method not found: ' + h[0]+'.'+h[1]);
    }

    return {
      method: 'GET',
      routeUrl: route.route,
      handlerController: cObj,
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
