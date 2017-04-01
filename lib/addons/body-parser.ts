'use strict';

import * as querystring from 'querystring';
// const IncomingForm = require('formidable').IncomingForm;

class BodyParser {
  parse(request): void {
    switch (request.getContentType()) {
      case 'application/json':
        this._parseJson(request);
        break;
      case 'application/x-www-form-urlencoded':
        this._parseUrlEncoded(request);
        break;
      case 'multipart/form-data':
        this._parseMultipart(request);
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

export const bodyParser = new BodyParser();
