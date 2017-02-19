'use strict';

const routeHelper = require('./helpers/route-helper');
const pathHelper = require('./helpers/path-helper');
const errorHelper = require('./helpers/error-helper');
const middlewareHelper = require('./helpers/middleware-helper');

class Router {
  constructor() {
    // route array set from the app.
    this.routeConfig = [];
    this._routes = {};
  }

  /*
  **       on: BOOTSTRAP
  **
  **  register the routes for the app
  **
  **  inputs
  **    - route config
  */
  routes(routeConfig) {
    // validate
    routeHelper.validateRouteConfig(routeConfig);
    this.routeConfig = routeConfig;
  }


  /*
  **       on: BOOTSTRAP
  **
  **  collect the routes with given route config
  **
  **  inputs
  **    - app config options
  */
  collectRoutes(options) {
    middlewareHelper.requireMiddleware({
      basePath: options.middlewarePath
    });

    this._routes = routeHelper.collectRoutes(this.routeConfig, {
      basePath: options.controllerPath
    });
  }

  /*
  **       on: REQUEST
  **
  **  get the matching route
  **
  **  inputs
  **    - http request
  */
  matchRoute(request) {
    return pathHelper.matchRoute(request.method, request.url, this._routes);
  }

}

module.exports = new Router();
