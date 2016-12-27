'use strict';

const status = require('./misc/status-codes');

class Response {
  constructor() {}

  init(res) {
    this.res = res;
  }

  send(statusCode, data) {
    if (!data || typeof data !== 'object') {
      this.reject(status.InternalServerError);
      return;
    }

    this.setHeaders();
    this.res.writeHead(statusCode.code);
    this.res.end(JSON.stringify(data, null, 2));
  }

  reject(statusCode, error) {
    this.setHeaders();
    this.res.writeHead(statusCode.code);
    this.res.end(JSON.stringify(statusCode.response));
  }

  setHeaders() {
    this.res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  }
}

// singleton
module.exports = new Response();
