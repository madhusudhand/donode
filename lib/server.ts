import './request';
import './response';

import { router } from './router';
import { appHeaders } from './headers';
import { appConfig } from './app-config';
import { statusCodes } from './misc/status-codes';
import { bodyParser } from './addons/body-parser';

class Server {
  /*
  **       on: BOOTSTRAP
  **
  **  creates a http server with the given app configuration
  **
  **  inputs
  **    - app config
  **
  **  returns
  **    - server
  */
  create({ config, routes, headers }) {
    appConfig.init(config);

    // collect headers
    appHeaders.collect(headers, appConfig.config);

    // collect application routes
    router.collectRoutes(routes, appConfig.config);

    return {
      listener: this._onRequest.bind(this),
      hostname: appConfig.config.envConfig.hostname,
      port: appConfig.config.envConfig.port,
    };
  }

  /*
  **       on: REQUEST
  **
  **  listener for http request
  **
  */
  _onRequest(request, response) {
    // parse the request
    request.__parseRequest();

    const match = router.matchRoute(request);
    if (match) {
      // set route and query params
      request.routeParams = match.routeParams;
      request.queryParams = request.url.query;

      // attach route headers to the response
      this._attachHeaders(response, match.route.headers);

      // on request data
      this._onData(request, () => {
        try {
          // execute middleware and then handler
          return this._runMiddlewareChain(request, response, match.route);
        } catch (err) {
          return response.reject(statusCodes.InternalServerError, err);
        }
      });
    } else {
      // if no route matched
      return response.reject(statusCodes.NotFound);
    }
  }


  /*
  **       on: REQUEST
  **
  **  get the request payload
  **
  **  inputs
  **    - callback
  */
  _onData(request, onComplete) {
    let body = '';
    request.on('data', (data) => {
      body += data;
      // NOTE: this limits the multipart data
      // TODO: handle multipart data
      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6)
        request.connection.destroy();
    }).on('end', () => {
      request.body = body;

      // parse request.body
      bodyParser.parse(request);
      onComplete();
    });
  }


  /*
  **       on: REQUEST
  **
  **  run the middleware chain (if any)
  **  and finally call the controller handler method
  **  if any middleware returns a response, the remaining chain will not execute
  **
  **  inputs
  **    - http request, http response, matching route
  */
  _runMiddlewareChain(request, response, route) {
    let index = 0;
    const n = Array.isArray(route.middleware) ? route.middleware.length : 0;

    return _next();
    function _next() {
      if (index >= n) {
        const controller = new route.controller();
        return controller[route.handle](request, response);
      }
      const middleware = new route.middleware[index++]();
      return middleware.handle(request, response, _next);
    }
  }


  /*
  **       on: REQUEST
  **
  **  attach the route heaers
  **
  **  THIS SHOULD GET A FLAT LIST OF HEADERS : Array[]
  **
  **  Do not add any validations here as this gets called for every request
  **  Having more validations impacts performance
  **  Do all kinds of validations at the time of server boostartap
  **
  **  inputs
  **    - http response, route headers
  */
  _attachHeaders(response, headers) {
    for (let i = 0; i < headers.length; i++) {
      response.setHeader(headers[i].name, headers[i].value);
    }
  }

}

export const server = new Server();
