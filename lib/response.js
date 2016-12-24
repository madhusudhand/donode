'use strict';

class Response {
  constructor(res) {
    this.res = res;
    // console.log(res);
  }

  send(data, statusCode) {
    this.setHeaders();
    this.res.writeHead(statusCode.code);
    this.res.end(JSON.stringify(data));
  }

  reject(statusCode) {
    this.setHeaders();
    this.res.writeHead(statusCode.code);
    this.res.end();
  }

  setHeaders() {
    this.res.setHeader('Content-Type', 'text/json; charset=UTF-8');
  }

}

module.exports = Response;
