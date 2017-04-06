export interface RouteConfig {
  path        : string,
  method     ?: string,
  handler    ?: string,
  middleware ?: any,
  headers    ?: any,
  children   ?: RouteConfig[],

  parent     ?: RouteConfig // internal use
}

export interface Route {
  method     : string,
  path       : string,
  footprint  : string,
  segments   : string[],
  params     : any,
  hasParams  : boolean,

  controller : any,    // controller class
  handle     : string, // handler method name
  middleware : any[],  // list of middleware classes
  headers    : any[],  // list of header objects
}

export interface Middleware {
  all      : string[],
  current  : string[],
  children : string[]
}

export interface RouteMap {
  [key: string]: Route[]
}

export interface RouteHandler {
  controllerName : string,
  controllerPath : string,
  methodName     : string
}
