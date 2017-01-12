'use strict';

const path = require('path');
const exportFiles = require('export-files');

class MiddlewareHelper {
  constructor() {
    // holds instances
    this._middlewareObjects = {};

    // holds classes
    this._middlewareClasses = [];
  }

  collectMiddleware(rawMiddleware, options) {
    // init
    this.middleware = {};

    this._middlewareClasses = this._loadMiddleware(options.basePath);
    this._preprocess(rawMiddleware);
    return this.middleware;
  }

  _preprocess(rawMiddleware) {
    for (let m in rawMiddleware) {
      this.middleware[m] = this._processMiddleware(rawMiddleware[m]);
    }
  }

  _processMiddleware(middlewareClassName) {
    // save the middleware objects
    if (!this._middlewareObjects[middlewareClassName]) {
      const Middleware = this._middlewareClasses[middlewareClassName];
      if (!Middleware) {
        throw Error('Middleware not found: ' + middlewareClassName);
      }
      this._middlewareObjects[middlewareClassName] = new Middleware();
    }

    return this._middlewareObjects[middlewareClassName];
  }

  _loadMiddleware(basePath) {
    return exportFiles(basePath);
  }
}

// singleton
module.exports = new MiddlewareHelper();
