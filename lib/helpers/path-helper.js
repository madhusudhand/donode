'use strict';

class PathHelper {
  constructor() {
    this.segments = [];
  }

  matchRoute(method, url, routes) {
    this.segments = url.pathname.split('/').slice(1);
    this.routeParams = {};
    const _routes = routes[method.toLowerCase()] || [];

    for (let i = 0, l = _routes.length; i < l; i++) {
      if (_routes[i].path === url.pathname) {
        return { route: _routes[i], routeParams: this.routeParams };
      } else if (_routes[i].hasParams) {
        if (this._matchSegments(_routes[i])) return { route: _routes[i], routeParams: this.routeParams };
      }
    }
  }

  _matchSegments(route) {
    // clear params
    this.routeParams = {};

    if (this.segments.length !== route.segments.length) {
      return false;
    }

    for (let i = 0, l = this.segments.length; i < l; i++) {
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
