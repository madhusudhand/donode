class PathHelper {
  public segments = [];
  public routeParams = {};

  /*
  **       on: REQUEST
  **
  **  match the route with request URL
  **
  **  inputs
  **    - request method
  **    - request url
  **    - list of registered routes
  **
  **  returns
  **    - matching route or null
  */
  matchRoute(method, url, routes) {
    // TODO: avoid class variables. make it functional
    // reset as it is a class variable
    this.routeParams = {};

    // get the segments of the url
    this.segments = url.pathname.split('/').slice(1);

    // get the routes for the current request method
    const _routes = routes[method.toLowerCase()] || [];

    for (let i = 0, l = _routes.length; i < l; i++) {
      // if the route matches with url path
      // this is given priority over matiching with params
      if (_routes[i].path === url.pathname) {
        return { route: _routes[i], routeParams: this.routeParams };
      } else if (_routes[i].hasParams) {
        if (this._matchSegments(_routes[i]))
          return { route: _routes[i], routeParams: this.routeParams };
      }
    }
  }


  /*
  **       on: REQUEST
  **
  **  match the route segments
  **
  **  inputs
  **    - request method
  **    - request url
  **    - list of registered routes
  **
  **  returns
  **    - matching route or null
  */
  _matchSegments(route) {
    // TODO: avoid class variables. make it functional
    // clear params as it is a class variable
    this.routeParams = {};

    // if segement count is not same, its not a matching route
    if (this.segments.length !== route.segments.length) {
      return false;
    }

    for (let i = 0, l = this.segments.length; i < l; i++) {
      // if the segment is a route param
      if (route.segments[i].indexOf('{') === 0) {
        // capture route param values
        this.routeParams[route.segments[i].slice(1,-1)] = this.segments[i];
      } else if(route.segments[i] === this.segments[i]) {
        // this is required to check if the segment matches
        continue;
      }
      else return false; // route not matching
    }

    // if everything is alright, its a martching route
    return true;
  }
}

// singleton
export const pathHelper = new PathHelper();
