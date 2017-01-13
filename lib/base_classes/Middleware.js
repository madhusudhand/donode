'use strict';

class Middleware {
  constructor() {}

  handle(request, next) {
    return next();
  }
}

module.exports = Middleware;
