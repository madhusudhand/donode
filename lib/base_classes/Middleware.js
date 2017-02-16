'use strict';

class Middleware {
  constructor() {}

  handle(request, response, next) {
    return next();
  }
}

module.exports = Middleware;
