'use strict';

class ParamHelper {
  constructor() {
    this.paramExpression = new RegExp('\{[A-Za-z]+[A-Za-z0-9]*\}');
  }

  parseParams(routeUrl) {
    const matche = routeUrl.match(this.paramExpression);
    // return matche.;
  }
}

module.exports = new ParamHelper();
