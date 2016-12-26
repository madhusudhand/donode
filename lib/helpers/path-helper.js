'use strict';

class PathHelper {
  constructor() {
    this.segments = [];
  }

  matchRoute(method, url, routes) {
    this.segments = url.pathname.split('/').slice(1);
    this.routeParams = {};
    for (const route of routes[method.toLowerCase()] || []) {
      if (route.path === url.pathname) {
        return { route, routeParams: this.routeParams };
      } else if (route.hasParams) {
        if (this._matchSegments(route)) return { route, routeParams: this.routeParams };
      }
    }
  }

  _matchSegments(route) {
    // clear params
    this.routeParams = {};

    if (this.segments.length !== route.segments.length) {
      return false;
    }

    for (const i in this.segments) {
      if (route.segments[i].indexOf('{') === 0) {
        // capture param values
        this.routeParams[route.segments[i].slice(1,-1)] = this.segments[i];
      } else if(route.segments[i] === this.segments[i]) {
        // console.log('chars : ' + route.segments[i] + ' , ' + this.segments[i]);
      }
      else return false;
    }

    return true;
  }
}

// singleton
module.exports = new PathHelper();
