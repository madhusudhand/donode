'use strict';
const Router = require('./lib/router');
const Server = require('./lib/server');

module.exports = {
  Router: new Router(),
  Server,
}
