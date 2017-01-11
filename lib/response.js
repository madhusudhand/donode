'use strict';

const http = require('http');
const statusCodes = require('./misc/status-codes');

((response) => {
  Object.assign(response, {
    // properties

    // methods: framework
    __preprocess,
    __send,
    __reject,
    __setHeaders,

    // methods: public

  });

  function __preprocess() {

  }

  function __send(status, data) {
    if (!data || typeof data !== 'object') {
      this.__reject(statusCodes.InternalServerError);
      return;
    }

    this.__setHeaders();
    this.writeHead(status.code);
    this.end(JSON.stringify(data, null, 2));
  }

  function __reject(status, error) {
    this.__setHeaders();
    this.writeHead(status.code);
    this.end(JSON.stringify(status.response, null, 2));
  }

  function __setHeaders() {
    this.setHeader('Content-Type', 'application/json; charset=UTF-8');
  }
})(http.ServerResponse.prototype);
