'use strict';

class Response {
  constructor() {}

  init(res) {
    this.res = res;
  }

  send(data, statusCode) {
    if (!data || typeof data !== 'object') {
      this.reject({code: 500});
      return;
    }

    this.setHeaders();
    this.res.writeHead(statusCode.code);
    this.res.end(JSON.stringify(data, null, 2));
  }

  reject(statusCode) {
    this.setHeaders();
    this.res.writeHead(statusCode.code);
    this.res.end();
  }

  setHeaders() {
    this.res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  }
}

// singleton
module.exports = new Response();
