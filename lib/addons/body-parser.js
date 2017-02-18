'use strict';

const querystring = require('querystring');
// const IncomingForm = require('formidable').IncomingForm;

class BodyParser {
  constructor() {}

  parse(request) {
    switch (request.getContentType()) {
      case 'application/json':
        return this._parseJson(request);
        break;
      case 'application/x-www-form-urlencoded':
        return this._parseUrlEncoded(request);
        break;
      case 'multipart/form-data':
        return this._parseMultipart(request);
        break;
    }
  }

  _parseJson(request) {
    request.body = JSON.parse(request.body);
  }

  _parseUrlEncoded(request) {
    // console.log(request.body);
    request.body = querystring.parse(request.body);
  }

  _parseMultipart(request) {
    // var form = new IncomingForm();
    // form.onPart(() => {
    //   console.log('onPart called');
    // });
    // form.parse(request, (err, fields, files) => {
    //   console.log('fields');
    //   console.log(fields);
    //   console.log('files');
    //   console.log(files);
    // });
  }
}

module.exports = new BodyParser();
