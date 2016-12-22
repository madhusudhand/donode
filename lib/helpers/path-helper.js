'use strict';

class PathHelper {
  constructor() {
    this.segments = [];
  }

  matchRoute(method, path, routes) {
    this.segments = path.split('/').slice(1);

    for (var route of routes[method.toLowerCase()]) {
      // const route = routes[key];
      console.log(route);

      if (route.path === path) {
        return route;
      }
    }
  }
}

module.exports = PathHelper;
