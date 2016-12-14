'use strict';

class Router {
  constructor() {
    this.routes = [];
  }

  get(route, callback) {
    console.log('router get called');
    this.routes.push({
      method: 'GET',
      routeUrl: route,
      handler: callback
    });
  }

  getRoutes() {
    return this.routes;
  }
}

module.exports = Router;
