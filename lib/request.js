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
    __parseRequest,

    // methods: public
    getContentType,
  });

  // this is called on-request
  function __parseRequest() {
    // parse url
    this.originalUrl = this.url;
    this.url = url.parse(this.url, true);
  }

  function getContentType() {
    // RFC2616 section 7.2.1
    return (this.headers['content-type'] || 'application/octet-stream')
           .split(';')[0].toLowerCase();
  }
})(http.IncomingMessage.prototype);
