'use strict';

const http = require('http');
const path = require('path');
const querystring = require('querystring');

const Request = require('./request');
const Response = require('./response');

class Server {
  constructor(router, config) {
    this.router = router;
    this.config = config;

    this.router.processRoutes(this.config.appRoot);

    this.listner = http.createServer();
    this.listner.on('request', this._onRequest.bind(this));
  }

  _onRequest(req, res) {
    this.request = new Request(req);
    // this.response = new Response(res);

    this._onData(() => {
      let result = {};

      const route = this.router.getRoute(this.request);
      if (route) {
        result = route.handler(this.request);
      } else {
        result = { res: '404' };
      }

      res.writeHead(200, {'Content-Type': 'text/json; charset=UTF-8'});
      res.end(JSON.stringify(result));
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
