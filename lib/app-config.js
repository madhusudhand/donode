'use strict';

const path = require('path');
const envHelper = require('./helpers/env-helper');

// TODO: Doesn't make sense to have it as singletone
// as its called one time during server startup

class Config {
  constructor() {}

  /*
  **       on: BOOTSTRAP
  **
  **  read, validate, merge and return app config
  **
  */
  getConfig(config) {
    const _config = {};
    this._validate(config);

    // TODO: turn them read-only and private
    Object.assign(_config, config, {
      middlewarePath: path.join(config.appRoot, config.appDir, config.middlewareDir),
      controllerPath: path.join(config.appRoot, config.appDir, config.controllerDir),
      environmentPath: path.join(config.appRoot, config.envDir),
      relMiddlewarePath: path.join(config.appDir, config.middlewareDir),
      relControllerPath: path.join(config.appDir, config.controllerDir)
    });

    // override with environment specific configuration
    Object.assign(_config, envHelper.getEnvironmentConfig({
      environmentPath: _config.environmentPath,
      environment: _config.environment
    }));

    this._attachMandatoryConfigurations(_config);
    return _config;
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


  _attachMandatoryConfigurations(config) {
    // TODO: add validations
  }
}

module.exports = Config;
