'use strict';

const cookie = require('cookie');
// const IncomingForm = require('formidable').IncomingForm;

class BodyParser {
  constructor() {}

  parse(request) {
    request.cookie = cookie.parse(request.headers.cookie || '');
  }
}

module.exports = new BodyParser();
