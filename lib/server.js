'use strict';

const http = require('http');
const path = require('path');

const Request = require('./request');
const Response = require('./response');

class Server {
  constructor(router, config) {
    this.listner = http.createServer();
    this.listner.on('request', this._onRequest.bind(this));
    this.router = router;
    this.config = config;

    // this.controllers = exportFiles(path.join(this.config.appRoot, 'app', 'controllers'));
    this.router.init(this.config.appRoot);

    console.log(this.controllers);
  }

  _onRequest(req, res) {
    this.request = new Request(req);
    this.response = new Response(res);

    // const handler = this.router.routes[0].handler.split('@');
    // const controller = new this.controllers[handler[0]]();
    // const result = controller[handler[1]]();

    let result = {};

    const routeHandler = this.router.getRoute(this.request);
    if (routeHandler) {
      result = routeHandler.handlerMethod();
    } else {
      result = { res: '404' };
    }

    // console.log(result);



    res.writeHead(200, {'Content-Type': 'text/json; charset=UTF-8'});
    res.end(JSON.stringify(result));
  }
}

module.exports = Server;
