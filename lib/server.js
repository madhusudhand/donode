'use strict';

const http = require('http');
const path = require('path');

const router = require('./router');
const request = require('./request');
const response = require('./response');
const status = require('./misc/status-codes');
const bodyParser = require('./addons/body-parser');
const configHelper = require('./helpers/config-helper');

class Server {
  constructor() {}

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
  create(config) {
    // validate the given app configuration
    configHelper.validate(config);

    this.router = router;
    this.config = config;

    this.router.collectRoutes({
      middlewarePath: path.join(this.config.appRoot, this.config.appDir, this.config.middlewareDir),
      controllerPath: path.join(this.config.appRoot, this.config.appDir, this.config.controllerDir)
    });

    this.listener = http.createServer();
    this.listener.on('listening', this._onListening.bind(this));
    this.listener.on('request', this._onRequest.bind(this));

    return this.listener;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  log information on server startup
  **
  */
  _onListening() {
    const addr = this.listener.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  }

  /*
  **       on: REQUEST
  **
  **  listener for http request
  **
  */
  _onRequest(request, response) {
    // parse the request url
    request.__parseUrl();

    const match = this.router.matchRoute(request);
    if (match) {
      // set route and query params
      request.routeParams = match.routeParams;
      request.queryParams = request.url.query;

      // attach route headers
      this._attachHeaders(response, match.route.headers);

      // on request data
      this._onData(request, () => {
        try {
          // execute middleware and then handler
          return this._runMiddlewareChain(request, response, match.route);
        } catch (err) {
          return response.reject(status.InternalServerError, err);
        }
      });
    } else {
      // if no route matched
      return response.reject(status.NotFound);
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

module.exports = new Server();
