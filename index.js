'use strict';
const Router = require('./lib/router');
const Server = require('./lib/server');

const Controller = require('./lib/base_classes/Controller');
const Middleware = require('./lib/base_classes/Middleware');

module.exports = {
  Router,
  Server,

  // base classes
  Controller,
  Middleware,
}
