'use strict';

const http = require('http');
const path = require('path');

const router = require('./router');
const request = require('./request');
const response = require('./response');
const status = require('./misc/status-codes');
const bodyParser = require('./addons/body-parser');

class Server {
  constructor() {}

  create(config) {
    this.router = router;
    this.config = config;

    this.router.collectRoutes({
      middlewarePath: path.join(this.config.appRoot, 'app', 'middleware'),
      controllerPath: path.join(this.config.appRoot, 'app', 'controllers')
    });

    this.listener = http.createServer();
    this.listener.on('listening', this._onListening.bind(this));
    this.listener.on('request', this._onRequest.bind(this));

    return this.listener;
  }

  _onListening() {
    const addr = this.listener.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  }

  _onRequest(req, res) {
    this.request = req;
    this.response = res;

    // do some pre-processing
    this.request.__preprocess();
    this.response.__preprocess();

    if (!this.request.__validate()){
      return this.response.reject(status.BadRequest);
    }

    this._onData(() => {
      let result = {};

      const match = this.router.matchRoute(this.request);
      if (match) {
        this.request.routeParams = match.routeParams;
        this._attachHeaders(this.response, match.route.headers);

        try {
          return this._runMiddlewareChain(match.route);
        } catch (err) {
          return this.response.reject(status.InternalServerError, err);
        }
      }

      return this.response.reject(status.NotFound);
    });
  }


  // NOTE: handle multipart data
  _onData(onComplete) {
    let body = '';
    this.request.on('data', (data) => {
      body += data;
      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6)
        this.request.connection.destroy();
    }).on('end', () => {
      this.request.body = body;
      // do body parsing
      bodyParser.parse(this.request);
      onComplete();
    });
  }

  // pass the request through all middleware chain
  // and finally call the controller handler method
  // if any middleware returns a response, the remaining chain will not execute
  _runMiddlewareChain(route) {
    let index = 0;
    const n = Array.isArray(route.middleware) ? route.middleware.length : 0;
    const request = this.request;
    const response = this.response;

    return _next();
    function _next() {
      if (index >= n) return route.controller[route.handle](request, response);
      return route.middleware[index++].handle(request, response, _next);
    }
  }


  // called for each REQUEST
  // THIS SHOULD GET A FLAT LIST OF HEADERS : Array[]
  //
  // Do not add any validations here as this gets called for every request
  // Having more validations impacts performance
  // Do all kinds of validations at the time of server boostartap
  _attachHeaders(response, headers) {
    for (let i = 0; i < headers.length; i++) {
      response.setHeader(headers[i].name, headers[i].value);
    }
  }

}

module.exports = new Server();
