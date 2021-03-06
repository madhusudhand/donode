'use strict';

require('./request');
require('./response');

const router = require('./router');
const appHeaders = require('./headers');
const Config = require('./app-config');

const status = require('./misc/status-codes');
const bodyParser = require('./addons/body-parser');
const cookieParser = require('./addons/cookie-parser');
// const serveStatic = require('serve-static');
const serveStatic = require('./addons/serve-static');

class Server {
  constructor() {
    this.config = {};
  }

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
    this.config = (new Config).getConfig(config);

    // collect headers
    appHeaders.collect(headers, this.config);

    // collect application routes
    router.collectRoutes(routes, this.config);

    return {
      listener: this._onRequest.bind(this),
      hostname: this.config.hostname,
      port: this.config.port,
      config: this.config,
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
      request.params = match.routeParams;
      request.query = request.url.query;

      // attach route headers to the response
      this._attachHeaders(response, match.route.headers);

      // on request data
      this._onData(request, () => {
          this._runMiddlewareChain(request, response, match.route)
          .catch(err => {
            if (!this.config.production) {
              console.log('ERROR:', err);
            }
            response.reject(status.InternalServerError, err);
          });
      });
    } else if(request.method === 'GET' && this.config.publicDir) {
      serveStatic(this.config.publicDir)(request, response, () => response.reject(status.NotFound));
    } else {
      // no match found, handle the request
      this._handle(request, response);
      // return response.reject(status.NotFound);
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
      cookieParser.parse(request);
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
  async _runMiddlewareChain(request, response, route) {
    let index = 0;
    const n = Array.isArray(route.middleware) ? route.middleware.length : 0;

    return await _next();
    async function _next() {
      if (index >= n) {
        const controller = new route.controller();
        return await controller[route.handle](request, response);
      }
      const middleware = new route.middleware[index++]();
      return await middleware.handle(request, response, _next);
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


  _handle(request, response) {
    // options request
    if (request.method === 'OPTIONS') {
      // send an OPTIONS response
      const options = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'];
      const body = options.join(',');
      response.setHeader('Allow', body);
      response.send({ allowed: body });
    } else {
      response.reject(status.NotFound);
    }
  }

}

module.exports = new Server();
