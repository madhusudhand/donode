'use strict';

const url = require('url');

class Request {
  constructor(req) {
    // this.incomingMessage = req;
    //
    // this.method = req.method;
    // this.url = url.parse(this.incomingMessage.url, true);
    // this.headers = req.headers;
    //
    // this.routeParams = {};
    // this.queryParams = this.url.query;
    // this.inputs = {};
  }

  init(req) {
    this.incomingMessage = req;

    this.method = req.method;
    this.url = url.parse(this.incomingMessage.url, true);
    this.headers = req.headers;

    this.routeParams = {};
    this.queryParams = this.url.query;
    this.inputs = {};
  }
}

// singleton
module.exports = new Request();
