'use strict';

class PathHelper {
  constructor() {
    this.segments = [];
  }

  matchRoute(method, path, routes) {
    this.segments = path.split('/').slice(1);

    for (const route of routes[method.toLowerCase()]) {
      if (route.path === path) {
        return route;
      } else if (route.hasParams) {
        if (this._matchSegments(route)) return route;
      }
    }

  }

  _matchSegments(route) {
    if (this.segments.length !== route.segments.length) {
      return false;
    }

    for (const i in this.segments) {
      if (route.segments[i].indexOf('{') > -1) {
        console.log('param : ' + route.segments[i]);
      } else if(route.segments[i] === this.segments[i]) {
        console.log('chars : ' + route.segments[i] + ' , ' + this.segments[i]);
      }
      else return false;
    }

    return true;
  }
}

module.exports = PathHelper;
