'use strict';

const RouteHelper = require('./helpers/route-helper');

class Router {
  constructor() {
    // route array set from the app.
    this._rawRoutes = [];

    this._routes = {
      plainRoutes: {},
      paramRoutes: {}
    };

    this._routeHelper = new RouteHelper();
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

  getRoute(request) {
    let routes = this._routes.plainRoutes[request.routeUrl];

    if (!routes) {
      return;
    }

    routes = routes.filter((r) => {
      return r.method === request.method;
    });

    return routes.length > 0 ? routes[0] : null;
  }


}

module.exports = Router;
