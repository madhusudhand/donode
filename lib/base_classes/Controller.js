'use strict';

class Controller {
  constructor() {}

  middleware(handler, params) {

  }

  response(res) {
    return { value: Promise.resolve(res), done: true };
  }
}

module.exports = Controller;
