'use strict';

const path = require('path');
const requireDir = require('require-directory');
const errorHelper = require('./error-helper');
const defaultEnvSettings = require('../misc/default.env');

class EnvironmentHelper {
  constructor() {
    this.environment = 'development'; // default
    this.envConfig = null;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  returns environment settings
  */
  getEnvironmentConfig({ environmentPath, environment }) {
    return this.envConfig || this.requireEnvironmentConfig(environmentPath, environment);
  }


  /*
  **       on: BOOTSTRAP
  **
  **  Load environment settings from given path
  */
  requireEnvironmentConfig(environmentPath, environment) {
    this.environment = environment || this.environment;
    const envFileName = this.environment + '.env';

    let envConfig;
    try {
      envConfig = requireDir(module, environmentPath)[envFileName]
    } catch (e) {
      // show warning and proceed with default config
      errorHelper.throwWarning({
        warning : `invalid environment path.`,
        line: `${environmentPath}`
      });
    }

    this.envConfig = this.validate(envConfig, environment);
    return Object.assign(this.envConfig, { environment: this.environment });
  }

  /*
  **       on: BOOTSTRAP
  **
  **  validate the config and set defaults for required properties
  */
  validate(envConfig, environment) {
    if (!envConfig) {
      // show warning and proceed with defaults
      errorHelper.throwWarning({
        warning : `configuration file not found for the environment: ${environment}`,
        line : `falling back to default configuration.`,
        file    : `missing file - ${environment}.env.js`
      });

      return defaultEnvSettings;
    }

    envConfig.port = envConfig.port || defaultEnvSettings.port;
    return envConfig;
  }

}

// singleton
module.exports = new EnvironmentHelper();
