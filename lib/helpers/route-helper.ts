import * as path from 'path';
// import * as requireDir from 'require-directory';
const requireDir = require('require-directory');

import { paramHelper } from './param-helper';
import { errorHelper } from './error-helper';
import { middlewareHelper } from './middleware-helper';
import { headersHelper } from './headers-helper';
import { appHeaders } from '../headers';
import { AppConfig, RouteConfig, RouteMap, RouteHandler } from '../definitions';

class RouteHelper {
  private _controllerClasses: any = {};
  private _controllers: any = {};
  private _appConfig: AppConfig;

  public routes: RouteMap = {};

  /*
  **       on: BOOTSTRAP
  **
  **  validates the given route config
  **
  **  inputs
  **    - route config
  **      - [ of objects ]
  */
  validateRouteConfig(routeConfig: RouteConfig[]) {
    if (!Array.isArray(routeConfig)) {
      errorHelper.throwError({
        error: 'not a valid route list.',
        line : 'router.routes() takes an array objects',
        file : 'routes.js',
        hint : 'should be array of objects.'
      });
    }
  }

  /*
  **       on: BOOTSTRAP
  **
  **  collect all routes of the app based on the given route config
  **
  **  inputs
  **    - route config
  **    - options
  **
  **  returns
  **    - list of processed routes
  */
  collectRoutes(routeConfig: RouteConfig[], appConfig: AppConfig) {
    // init routes
    this.routes = {};
    this._appConfig = appConfig;

    // collect all controllers from the given controllerDir
    this._controllerClasses = requireDir(module,
                                         this._appConfig.controllerPath,
                                         { exclude: (path: string) => (/\.test\.js$/.test(path)) }
                                        );

    this._processRouteConfig(routeConfig);
    return this.routes;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  recursive call process each route config item
  **
  */
  _processRouteConfig(routeConfig: RouteConfig[], parent?: RouteConfig) {

    for (let route of routeConfig) {
      // "method" property is mandatory to consider it as a valid route.
      // if no method is specified, its path will be considered prefix for children
      if (route.method) {
        // validate in dev mode
        if (!this._appConfig.envConfig.production) {
          this._validateRoute(route);
        }

        // attach parent
        route.parent = parent;
        this._pushRoute(this._processRoute(route));
      }

      // if the route has children, make a recursive call
      if (Array.isArray(route.children)) {
        this._processRouteConfig(route.children, route);
      }
    }

  }

  /*
  **       on: BOOTSTRAP
  **
  **  process a given route
  **
  */
  _processRoute(route: RouteConfig): Route {
    // split the handler string "path/ControllerName@methodName"
    const handler: RouteHandler = this._splitHandler(route.handler);
    const controllerKey: string = path.join(handler.controllerPath, handler.controllerName);

    // check if the controller has already validated.
    if (!this._controllers[controllerKey]) {
      let ctrlClasses: any = null;

      // if the controller prefixed with some path
      if (handler.controllerPath) {
        // TODO: test this split function in different OS
        for (let key of handler.controllerPath.split(path.delimiter)) {
          ctrlClasses = this._controllerClasses[key];

          // controller path is not found
          if (!ctrlClasses) {
            errorHelper.throwError({
              error: `directory '${handler.controllerPath}' not found in '${this._appConfig.relControllerPath}'`,
              line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
              file : `routes.js`,
              hint : `make sure path is correct (case sensitive) and is present in ${this._appConfig.relControllerPath}`
            });
          }
        }
      } else {
        ctrlClasses = this._controllerClasses;
      }

      const ControllerClass = ctrlClasses[handler.controllerName];

      // validate in dev mode
      if (!this._appConfig.envConfig.production) {
        // controller doesn't exists in the given controller path
        if (!ControllerClass) {
          errorHelper.throwError({
            error: `Controller '${handler.controllerName}' not found.`,
            line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
            file : `routes.js`,
            hint : [`make sure Controller exists in ${path.join(this._appConfig.relControllerPath, handler.controllerPath)}.`,
                    `'filename' should be same as controller (case sensitive).`]
          });
        }

        // file exists but not exporting a class
        if (typeof ControllerClass !== 'function') {
          errorHelper.throwError({
            error: `Controller '${handler.controllerName}' is not a 'Class' or 'module.exports' is missing in the file.`,
            line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
            file : `${path.join(this._appConfig.relControllerPath, controllerKey)}.js`,
            hint : `A controller is a class and should be exported. check if module.exports = ClassName; is missing.`
          });
        }

        // method not defined in the controller
        if (typeof ControllerClass.prototype[handler.methodName] !== 'function') {
          errorHelper.throwError({
            error: `handler method '${handler.methodName}' not defined in '${handler.controllerName}'`,
            line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
            file : `${path.join(this._appConfig.relControllerPath, controllerKey)}.js`,
            hint : `add the method in controller.`
          });
        }
      }

      // cache the controller.
      this._controllers[controllerKey] = ControllerClass;
    }

    // route params
    const params = paramHelper.parseParams(route.path);
    const routePath = this._getRoutePath(route);

    return {
      method: route.method.toUpperCase(),
      path: this._trimTrailingSlash(routePath),
      segments: this._getSegments(routePath),
      footprint: this._getRouteFootprint(routePath),
      params: params,
      hasParams: !!params.length,

      controller: this._controllers[controllerKey],
      handle: handler.methodName,
      middleware: middlewareHelper.getRouteMiddleware(route),
      headers: headersHelper.getHeaders(appHeaders, route.headers),
    };
  }

  /*
  **       on: BOOTSTRAP
  **
  **  validate a given route configuration
  **
  */
  _validateRoute(route: Route): void {
    // path
    // REQUIRED
    if (!route.path) {
      errorHelper.throwError({
        error: `missing path.`,
        line : `Route { path: ${route.path}, method: ${route.method} }`,
        file : `routes.js`,
        hint : `add a 'path' property.`
      });
    }

    // Should start with /
    if (route.path.slice(0, 1) !== '/') {
      errorHelper.throwError({
        error: `path should start with '/'`,
        line : `Route { path: ${route.path}, method: ${route.method} }`,
        file : `routes.js`,
        hint : `prepend '/' to the path.`
      });
    }

    // handler
    // REQUIRED
    if (!route.handler) {
      errorHelper.throwError({
        error: `missing handler.`,
        line : `Route { path: ${route.path}, method: ${route.method} }`,
        file : `routes.js`,
        hint : `add a 'handler' (or) remove 'method' property, if the 'path' is prefix for child routes.`
      });
    }

    // FORMAT
    const index = route.handler.indexOf('@');
    if (index === -1 || index === route.handler.length-1) {
      errorHelper.throwError({
        error: `invalid format for 'handler'.`,
        line : `Route: { path: ${route.path}, method: ${route.method}, handler: ${route.handler} }`,
        file : `routes.js`,
        hint : `valid format - SomeController@method`
      });
    }

    // HEADERS [OPTIONAL]
    headersHelper.validateRouteHeaders(appHeaders, route);
  }


  /*
  **       on: BOOTSTRAP
  **
  **  push the processed route to the app route list
  **  check for the conflicts if any
  */
  private _pushRoute(route: Route): void {
    const method = route.method.toLowerCase();

    if (!Array.isArray(this.routes[method])) {
      this.routes[method] = [];
    }

    // check if similar route exists (dev mode)
    if (!this._appConfig.envConfig.production) {
      for (let _route of this.routes[method]) {
        if (_route.footprint === route.footprint) {
          errorHelper.throwError({
            error: `route conflict.`,
            line : [
              `following routes appears either same or conflicting.`,
              `Route 1: { path: ${route.path}, method: ${route.method} }`,
              `Route 2: { path: ${_route.path}, method: ${_route.method} }`
            ],
            file : `routes.js`,
            hint : `a route must be unique by its 'path' and 'method'`
          });
        }
      }
    }

    this.routes[method].push(route);
  }


  /*
  **       on: BOOTSTRAP
  **
  **  traverse though the parent hierarchy to fetch complete route path
  **
  */
  private _getRoutePath(route: Route): string {
    if (!route) return '';
    return route.parent ? (this._getRoutePath(route.parent) + route.path) : route.path;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  traverse though the parent hierarchy to fetch complete route path
  **
  */
  private _trimTrailingSlash(routePath: string): string {
    return (routePath.length > 1 && routePath[routePath.length-1] === '/')
         ? routePath.slice(0, -1) : routePath;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  get the route footprint
  **  replace route params with "?"
  */
  private _getRouteFootprint(routePath: string): string {
    const segments: string[] = this._getSegments(routePath);
    return '/' + segments.map((s: string) => this._hasParams(s) ? '?' : s).join('/');
  }

  /*
  **       on: BOOTSTRAP
  **
  **  get the segemnts of the route with "/" separator
  */
  private _getSegments(routePath: string): string[] {
    return this._trimTrailingSlash(routePath).split('/').slice(1);
  }

  /*
  **       on: BOOTSTRAP
  **
  **  check if the route has params
  */
  private _hasParams(routePath: string): boolean {
    return routePath.indexOf('{') > -1;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  split the route handler string
  **  inputs
  **    - handler string  -> "path/to/ControllerName@methodName"
  */
  private _splitHandler(handlerString: string): RouteHandler {
    const hs: string[] = handlerString.split('@');
    const controllerName: string = path.basename(hs[0]);
    let controllerPath: string = path.dirname(hs[0]) || '';
    if (controllerPath.charAt(0) === '.') {
      controllerPath = '';
    }

    return {
      controllerName,
      controllerPath,
      methodName: hs.length > 1 ? hs[1] : null
    };
  }

}

// singleton
export const routeHelper = new RouteHelper();
