'use strict';
const Server = require('./lib/server');
const Controller = require('./lib/base_classes/Controller');
const Middleware = require('./lib/base_classes/Middleware');

module.exports = {
  donode: Server,

  // base classes
  Controller,
  Middleware,
}
