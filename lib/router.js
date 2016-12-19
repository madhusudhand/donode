'use strict';

const RouteHelper = require('./route-helper');

class Router {
  constructor() {
    this.routes = {};
    this.rawRoutes = [];
  }

  get(route, handler) {
    this.rawRoutes.push({route, handler});
  }

  getRoute(request) {
    return this.routes[request.routeUrl];
  }

  init(appRoot) {
    const routeHelper = new RouteHelper();
    this.routes = routeHelper.getRoutes(this.rawRoutes, {
      appRoot
    });
  }
}

module.exports = Router;
