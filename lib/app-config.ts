import * as path from 'path';
import { envHelper } from './helpers/env-helper';
import { AppConfig } from './definitions/app-config.interface';

class Config {
  public config: AppConfig;

  init(config: any) {
    this._validate(config);

    this.config = Object.assign({}, config, {
      middlewarePath: path.join(config.appRoot, config.appDir, config.middlewareDir),
      controllerPath: path.join(config.appRoot, config.appDir, config.controllerDir),
      relMiddlewarePath: path.join(config.appDir, config.middlewareDir),
      relControllerPath: path.join(config.appDir, config.controllerDir),
      environmentPath: path.join(config.appRoot, config.envDir),
      relEnvironmentPath: path.join(config.envDir),
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
  _validate(config: any) {
    // TODO: add validations
  }


  _postValidate(config: any) {
    // TODO: add validations
  }
}

export const appConfig: Config = new Config();
