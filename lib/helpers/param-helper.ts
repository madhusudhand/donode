class ParamHelper {
  public paramExpression: RegExp;

  constructor() {
    this.paramExpression = new RegExp('\{[A-Za-z]+[A-Za-z0-9]*\}');
  }

  /*
  **       on: BOOTSTRAP
  **
  **  find the route params from the given route path
  **
  **  param pattern
  **    - {paramName}
  */
  parseParams(routePath: string): string[] {
    const params: string[] = routePath.match(this.paramExpression);
    return params ? params.map(param => param.slice(1,-1)) : [];
  }
}

// singleton
export const paramHelper: ParamHelper = new ParamHelper();
