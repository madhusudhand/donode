import { EnvConfig } from '../definitions';

export const defaultEnvConfig: EnvConfig = {
  /*
  **  host
  */
  hostname: '',

  /*
  **  port number
  */
  port: process.env.PORT || 3000,

  /*
  ** ture : production mode
  ** false: development mode
  */
  production: false,

  /*
  ** 0: log everything
  ** 1: log warnings & errors
  ** 2: log errors only
  */
  logLevel: 0,
};
