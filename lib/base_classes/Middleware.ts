'use strict';

export abstract class Middleware {
  constructor() {}

  handle(request: any, response: any, next: any) {
    return next();
  }
}
