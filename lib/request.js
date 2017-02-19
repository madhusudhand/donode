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
    __parseUrl,

    // methods: public
    getContentType,
  });

  function __parseUrl() {
    this.originalUrl = this.url;
    this.url = url.parse(this.url, true);
  }

  function getContentType() {
    // RFC2616 section 7.2.1
    let contentType = this.headers['content-type'] || 'application/octet-stream';
    contentType = contentType.split(';')[0].toLowerCase();

    return contentType;
  }
})(http.IncomingMessage.prototype);
