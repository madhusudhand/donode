'use strict';

const RouteHelper = require('./helpers/route-helper');

class Router {
  constructor() {
    this.routeList = {};
    this.rawRoutes = [];
  }

  routes(routeList) {
    // validate
    if (!Array.isArray(routeList)) {
      console.error('Routes must be an array of objects');
      return;
    }
    this.rawRoutes = routeList;
  }

  

  getRoute(request) {
    let routes = this.routeList.plainRoutes[request.routeUrl];

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
    this.routeList = routeHelper.getRoutes(this.rawRoutes, {
      appRoot
    });
  }
}

module.exports = Router;
