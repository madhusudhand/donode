import * as path from 'path';
import * as requireDir from 'require-directory';
import { errorHelper } from './error-helper';
import { defaultEnvConfig } from '../misc/default.env';
import { EnvConfig } from '../definitions/env-config.interface';

class EnvironmentHelper {
  public environment: string = 'development';
  public envConfig: EnvConfig = defaultEnvConfig;

  /*
  **       on: BOOTSTRAP
  **
  **  returns environment settings
  */
  getEnvironmentConfig({ environmentPath, environment }: any): EnvConfig {
    return this.envConfig || this.requireEnvironmentConfig(environmentPath, environment);
  }


  /*
  **       on: BOOTSTRAP
  **
  **  Load environment settings from given path
  */
  requireEnvironmentConfig(environmentPath: string, environment: string): EnvConfig {
    this.environment = environment || this.environment;
    const envFileName = this.environment + '.env';

    try {
      this.envConfig = requireDir(module, environmentPath)[envFileName]
    } catch (e) {
      // show warning and proceed with default config
      errorHelper.throwWarning({
        warning : `invalid environment path.`,
        line: `${environmentPath}`
      });
    }

    this.validate(this.envConfig, environment);
    return this.envConfig;
  }

  /*
  **       on: BOOTSTRAP
  **
  **  validate the config and set defaults for required properties
  */
  validate(envConfig: EnvConfig, environment: string): void {
    if (!envConfig) {
      // show warning and proceed with defaults
      errorHelper.throwWarning({
        warning : `configuration file not found for the environment: ${environment}`,
        line : `falling back to default configuration.`,
        file    : `missing file - ${environment}.env.js`
      });
    }
  }

}

// singleton
export const envHelper: EnvironmentHelper = new EnvironmentHelper();
