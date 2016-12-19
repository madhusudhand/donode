'use strict';

const RouteHelper = require('./route-helper');

class Router {
  constructor() {
    this.routes = {};
    this.rawRoutes = [];
  }

  getRoute(request) {
    let routes = this.routes[request.routeUrl];

    if (!routes) {
      return;
    }

    routes = routes.filter((r) => {
      return r.method === request.method;
    });

    return routes.length > 0 ? routes[0] : null;
  }

  init(appRoot) {
    const routeHelper = new RouteHelper();
    this.routes = routeHelper.getRoutes(this.rawRoutes, {
      appRoot
    });
  }


  get(route, handler) {
    this.rawRoutes.push({route, method: 'GET', handler});
  }

  post(route, handler) {
    this.rawRoutes.push({route, method: 'POST', handler});
  }

  put(route, handler) {
    this.rawRoutes.push({route, method: 'PUT', handler});
  }

  delete(route, handler) {
    this.rawRoutes.push({route, method: 'DELETE', handler});
  }

  resource(route, handler) {
    this.rawRoutes.push({route, method: 'CRUD', handler});
  }
}

module.exports = Router;
