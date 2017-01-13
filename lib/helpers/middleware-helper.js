'use strict';

const path = require('path');
const exportFiles = require('export-files');

class MiddlewareHelper {
  constructor() {
    // holds classes
    this._middlewareClasses = [];
  }

  collectMiddleware(options) {
    // init
    this.middleware = {};

    this._middlewareClasses = this._loadMiddleware(options.basePath);
    this._preprocess();
    return this.middleware;
  }

  _preprocess() {
    // TODO: Avoid naming conflicts when loading from sub-directories
    for (let middlewareClassName in this._middlewareClasses) {
      const Middleware = this._middlewareClasses[middlewareClassName];
      this.middleware[middlewareClassName] = new Middleware();
    }
  }

  _loadMiddleware(basePath) {
    return exportFiles(basePath);
  }
}

// singleton
module.exports = new MiddlewareHelper();
