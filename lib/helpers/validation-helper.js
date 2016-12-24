'use strict';

const constants = require('./constants');

class ValidationHelper {
  constructor() {}

  isValidRequest(request) {
    return (constants.httpMethods.indexOf(request.method) > -1);
  }
}

// singleton
module.exports = new ValidationHelper();
