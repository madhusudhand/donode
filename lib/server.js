'use strict';

const http = require('http');
const path = require('path');
const querystring = require('querystring');

const request = require('./request');
const response = require('./response');

const validation = require('./helpers/validation-helper');
const constants = require('./helpers/constants');

class Server {
  constructor(router, config) {
    this.router = router;
    this.config = config;

    this.router.processRoutes(this.config.appRoot);

    this.request = request;
    this.response = response;

    this.listener = http.createServer();
    this.listener.on('listening', this._onListening.bind(this));
    this.listener.on('request', this._onRequest.bind(this));
  }

  _onListening() {
    const addr = this.listener.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  }

  _onRequest(req, res) {
    this.request.init(req);
    this.response.init(res);

    if (!validation.isValidRequest(this.request)){
      return this.response.reject(constants.statusCode.badRequest);
    }

    this._onData(() => {
      let result = {};

      const match = this.router.matchRoute(this.request);
      if (match) {
        this.request.routeParams = match.routeParams;
        result = match.route.handler(this.request);

        return this.response.send(result, constants.statusCode.OK);
      }

      return this.response.reject(constants.statusCode.NotFound);
    });
  }


  // NOTE: handle multipart data
  _onData(onComplete) {
    let body = '';
    this.request.incomingMessage.on('data', (data) => {
      body += data;
      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6)
        this.request.incomingMessage.connection.destroy();
    }).on('end', () => {
      this.request.inputs = querystring.parse(body);
      onComplete();
    });
  }

}

module.exports = Server;
