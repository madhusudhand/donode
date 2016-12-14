'use strict';

const http = require('http');

const Request = require('./request');
const Response = require('./response');

class Server {
  constructor() {
    this.listner = http.createServer();
    this.listner.on('request', this._onRequest);
  }

  _onRequest(req, res) {
    this.request = new Request(req);
    this.response = new Response(res);

    res.writeHead(200, {'Content-Type': 'text/json; charset=UTF-8'});
    res.end(JSON.stringify({ res: 'hello' }));
  }
}

module.exports = Server;
