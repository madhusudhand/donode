'use strict';

const RouteHelper = require('./helpers/route-helper');
const PathHelper = require('./helpers/path-helper');

class Router {
  constructor() {
    // route array set from the app.
    this._rawRoutes = [];
    this._routes = {};

    this._routeHelper = new RouteHelper();
    this._pathHelper = new PathHelper();
  }

  routes(routeList) {
    // validate
    // NOTE: Do More validations such as method, handler string etc...
    if (!Array.isArray(routeList)) {
      console.error('Routes must be an array of objects');
      return;
    }
    this._rawRoutes = routeList;
  }


  processRoutes(appRoot) {
    this._routes = this._routeHelper.processRoutes(this._rawRoutes, {
      appRoot
    });
  }

  matchRoute(request) {
    return this._pathHelper.matchRoute(request.method, request.url, this._routes);
  }


}

module.exports = Router;
