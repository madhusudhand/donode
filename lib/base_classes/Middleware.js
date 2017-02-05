'use strict';

class Middleware {
  constructor() {}

  handle(request, next) {
    return next();
  }

  response(res) {
    return { value: Promise.resolve(res), done: true };
  }

  next() {
    return { value: Promise.resolve(), done: false };
  }
}

module.exports = Middleware;
