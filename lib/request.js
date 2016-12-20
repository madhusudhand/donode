'use strict';

const url = require('url');

class Request {
  constructor(req) {
    this.incomingMessage = req;

    this.method = null;
    this.routeUrl = null;
    this.path = null;
    this.query = null;
    this.params = [];
    this.inputs = [];

    this._parse();
  }

  _parse() {
    // console.log(req.url);
    // console.log(url.parse(req.url, true));
    // for (var i in req) {
    //   console.log(i + ' -- ' + typeof req[i]);
    // }

    // console.log(req.method);
    // console.log(req.headers);

    this.routeUrl = this.incomingMessage.url;
    this.method = this.incomingMessage.method;
  }


}

module.exports = Request;
