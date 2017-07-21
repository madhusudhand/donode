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
  collectRoutes(rawRoutes, config) {
    routeHelper.validateRawRoutes(rawRoutes);
    middlewareHelper.requireMiddleware(config);

    this._routes = routeHelper.collectRoutes(rawRoutes, config);
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
    let method = request.method;
    // if (method === 'OPTIONS') {
    //   console.log(request.headers);
    //   const reqMethod = request.headers['access-control-request-method']; // 'Access-Control-Request-Method');
    //   if (reqMethod)
    //     method = reqMethod;
    // }

    return pathHelper.matchRoute(method, request.url, this._routes);
  }

}

module.exports = new Router();
