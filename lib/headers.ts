import { headersHelper } from './helpers/headers-helper';

class Headers {
  public headerGroups: any;

  constructor() {
    this.headerGroups = {};
  }

  /*
  **       on: BOOTSTRAP
  **
  **  register the list of header groups which can be configured for a route
  **
  **  inputs
  **    - header groups
  */
  collect(headerGroups: any, appConfig: any): void {
    // skip validations in prod
    if (!appConfig.envConfig.production) {
      headersHelper.validateHeaderDefinitions(headerGroups || {});
    }

    this.headerGroups = headerGroups;
  }

  /*
  **       on: REQUEST
  **
  **  return a single header group for the given key
  **
  **  inputs
  **    - header group name
  */
  __getHeaders(headerGroupName: any): any {
    return this.headerGroups[headerGroupName];
  }
}

export const appHeaders = new Headers();
