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

    // pre-process
    this.request.__preprocess();
    this.response.__preprocess();

    if (!this.request.__validate()){
      return this.response.__reject(status.BadRequest);
    }

    this._onData(() => {
      let result = {};

      const match = this.router.matchRoute(this.request);
      if (match) {
        this.request.routeParams = match.routeParams;
        try {
          result = this._runMiddlewareChain(match.route);
        } catch (e) {
          return this.response.__reject(status.InternalServerError, e);
        }
        return this.response.__send(status.OK, result);
      }

      return this.response.__reject(status.NotFound);
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

  _runMiddlewareChain(route) {
    if (!route.middleware) {
      return route.handler(this.request);
    }

    let index = 0;
    const n = route.middleware.length;
    const request = this.request;

    return _next();

    function _next() {
      if (index >= n) return route.handler(request);
      return route.middleware[index++].handle(request, _next);
    }
  }

}

module.exports = new Server();
