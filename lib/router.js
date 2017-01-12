'use strict';

const routeHelper = require('./helpers/route-helper');
const pathHelper = require('./helpers/path-helper');
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
    // NOTE: Do More validations such as method, handler string etc...
    if (!Array.isArray(routeList)) {
      console.error('Routes must be an array of objects');
      return;
    }
    this._rawRoutes = routeList;
  }

  middleware(middlewareList) {
    this._rawMiddlewareList = middlewareList;
  }


  collectRoutes(appRoot) {
    this._routes = routeHelper.collectRoutes(this._rawRoutes, {
      appRoot
    });
  }

  collectMiddleware(basePath) {
    this._middleware = middlewareHelper.collectMiddleware(this._rawMiddlewareList, {
      basePath
    });
  }

  matchRoute(request) {
    return pathHelper.matchRoute(request.method, request.url, this._routes);
  }
  
}

module.exports = new Router();
