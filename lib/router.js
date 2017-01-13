'use strict';

const routeHelper = require('./helpers/route-helper');
const pathHelper = require('./helpers/path-helper');
const errorHelper = require('./helpers/error-helper');
const middlewareHelper = require('./helpers/middleware-helper');

class Router {
  constructor() {
    // route array set from the app.
    this._rawRoutes = [];
    this._rawMiddlewareList = [];
    this._routes = {};
    this._middleware = {};
  }

  routes(routeList) {
    // validate
    if (!Array.isArray(routeList)) {
      errorHelper.throwError({
        error: 'not a valid route list.',
        line : 'router.routes() takes an array objects',
        file : 'routes.js',
        hint : 'should be array of objects.'
      });
    }

    this._rawRoutes = routeList;
  }

  collectRoutes(options) {
    const middleware = this._collectMiddleware(options.middlewarePath);

    this._routes = routeHelper.collectRoutes(this._rawRoutes, middleware,  {
      basePath: options.controllerPath
    });
  }

  _collectMiddleware(basePath) {
    return middlewareHelper.collectMiddleware({
      basePath
    });
  }

  matchRoute(request) {
    return pathHelper.matchRoute(request.method, request.url, this._routes);
  }

}

module.exports = new Router();
