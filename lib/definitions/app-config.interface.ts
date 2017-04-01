import { EnvConfig } from './env-config.interface';

export interface AppConfig {
  appRoot: string,
  appDir: string,
  controllerDir: string,
  middlewareDir: string,
  envDir: string,

  // paths
  controllerPath?: string,
  relControllerPath?: string,
  middlewarePath?: string,
  relMiddlewarePath?: string,
  environmentPath?: string,
  relEnvironmentPath?: string,

  // environment
  environment: string,
  envConfig: EnvConfig
}
