export interface Route {
  path        : string,
  method     ?: string,
  handler    ?: string,
  middleware ?: any,
  headers    ?: any,
  children   ?: Route[],

  parent     ?: Route // internal use
}
