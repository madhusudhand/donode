'use strict';

const http = require('http');
const url = require('url');

((request) => {
  Object.assign(request, {
    // properties
    routeParams: {},
    queryParams: {},
    body       : {},

    // methods: framework
    __preprocess,
    __parseUrl,
    __validate,

    // methods: public
    getContentType,
  });

  function __preprocess() {
    this.__parseUrl();
    request.queryParams = this.url.query;
  }

  function __parseUrl() {
    this.originalUrl = this.url;
    this.url = url.parse(this.url, true);
  }

  function __validate() {
    return true;
  }

  function getContentType() {
    // RFC2616 section 7.2.1
    let contentType = this.headers['content-type'] || 'application/octet-stream';
    contentType = contentType.split(';')[0].toLowerCase();

    return contentType;
  }
})(http.IncomingMessage.prototype);
