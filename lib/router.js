'use strict';

const routeHelper = require('./helpers/route-helper');
const pathHelper = require('./helpers/path-helper');
const errorHelper = require('./helpers/error-helper');
const middlewareHelper = require('./helpers/middleware-helper');

class Router {
  constructor() {
    // route array set from the app.
    this._routes = {};
  }


  /*
  **       on: BOOTSTRAP
  **
  **  collect the routes with given route config
  **
  **  inputs
  **    - app config options
  */
  collectRoutes(routeConfig, appConfig) {
    routeHelper.validateRouteConfig(routeConfig);
    middlewareHelper.requireMiddleware(appConfig);

    this._routes = routeHelper.collectRoutes(routeConfig, appConfig);
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
