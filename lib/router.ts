import { routeHelper } from './helpers/route-helper';
import { pathHelper } from './helpers/path-helper';
import { errorHelper } from './helpers/error-helper';
import { middlewareHelper } from './helpers/middleware-helper';

import { Route, RouteConfig, AppConfig } from './definitions';

class Router {
  private _routes: any;

  constructor() {
    // route array set from the app.
    this._routes = {};
  }


  /*
  **       on: BOOTSTRAP
  **
  **  collect the routes with given route config
  **
  **  inputs
  **    - app config options
  */
  collectRoutes(routeConfig: RouteConfig[], appConfig: AppConfig) {
    routeHelper.validateRouteConfig(routeConfig);
    middlewareHelper.requireMiddleware(appConfig);

    this._routes = routeHelper.collectRoutes(routeConfig, appConfig);
  }

  /*
  **       on: REQUEST
  **
  **  get the matching route
  **
  **  inputs
  **    - http request
  */
  matchRoute(request: any) {
    return pathHelper.matchRoute(request.method, request.url, this._routes);
  }

}

export const router = new Router();
