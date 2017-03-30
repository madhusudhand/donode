'use strict';

const path = require('path');
const envHelper = require('./helpers/env-helper');

class Config {
  constructor() {
    this.config = {};
  }

  init(config) {
    this._validate(config);

    this.config = Object.assign({}, config, {
      middlewarePath: path.join(config.appRoot, config.appDir, config.middlewareDir),
      controllerPath: path.join(config.appRoot, config.appDir, config.controllerDir),
      environmentPath: path.join(config.appRoot, config.envDir),
      relMiddlewarePath: path.join(config.appDir, config.middlewareDir),
      relControllerPath: path.join(config.appDir, config.controllerDir)
    });

    // get environment settings
    this.config.envConfig = envHelper.getEnvironmentConfig(this.config);

    this._postValidate(this.config);

    return this.config;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  validates the given app config
  **
  **  inputs
  **    - app config
  **
  **  validateions
  **    - appDir should exist
  **    - controllerDir should exist
  **    - middlewareDir should exist
  */
  _validate(config) {
    // TODO: add validations
  }


  _postValidate(config) {
    // TODO: add validations
  }
}

module.exports = new Config();
