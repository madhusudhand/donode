const http = require('http');
// import * as http from 'http';
import { statusCodes } from './misc/status-codes';

((response) => {
  Object.assign(response, {
    // properties
    __headersSent: false,

    // methods: public
    send,
    reject,
  });

  function send(status, data) {
    // default -> 200: OK
    // TODO: add validation for 1xx, 2xx, 3xx range of codes
    if (typeof status === 'number') {
      // get key for the status code
      status = statusCodes[status] || statusCodes[200];
      status = statusCodes[status.key];
    } else {
      data = status;
      status = _isValidResponse(data) ? statusCodes.OK : statusCodes.InternalServerError;
    }

    if (status.code === statusCodes.InternalServerError.code) {
      _reject.call(this, statusCodes.InternalServerError);
      return;
    }

    // do not add it to prototype (this._send) which is already exists in response.prototype
    _send.call(this, status, data);
  }

  function reject(status, error) {
    // default -> 400: BadRequest
    // TODO: add validation for 4xx, 5xx range of codes
    if (typeof status === 'number') {
      // get key for the status code
      status = statusCodes[status] || statusCodes[400];
      status = statusCodes[status.key];
    } else {
      error = status;
      status = _isValidResponse(error) ? statusCodes.BadRequest : statusCodes.InternalServerError;
    }
    _reject.call(this, status, error);
  }


  // private methods
  function _send(status, data) {
    if (!data) {
      status = statusCodes.NoContent;
    }

    _setHeaders.call(this);
    this.writeHead(status.code);
    if (status.code === statusCodes.NoContent.code) {
      this.end();
      return;
    }
    this.end(JSON.stringify(data || status.response || null, null, 2));
  }

  function _reject(status, error) {
    _setHeaders.call(this);
    this.writeHead(status.code);
    this.end(JSON.stringify(error || status.response || null, null, 2));
  }

  function _setHeaders() {
    this.setHeader('Content-Type', 'application/json; charset=UTF-8');
  }

  function _isValidResponse(data) {
    // accepts null, {}, []
    return typeof data === 'object' || typeof data === 'undefined';
  }
})(http.ServerResponse.prototype);
