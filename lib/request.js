'use strict';

const url = require('url');
const querystring = require('querystring');

class Request {
  constructor(req) {
    this.req = req;

    this.method = null;
    this.url = null;
    this.path = null;
    this.query = null;
    this.params = [];
    this.payload = [];

    this._parse();
  }

  _parse() {
    // console.log(req.url);
    // console.log(url.parse(req.url, true));
    // for (var i in req) {
    //   console.log(i + ' -- ' + typeof req[i]);
    // }

    // console.log(req.method);
    // console.log(req.headers);

    if (this.req.method == 'POST') {
        var body = '';

        this.req.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                this.req.connection.destroy();
        }).on('end', function () {
            var post = querystring.parse(body);
            console.log(post);
            // use post['blah'], etc.
        });
    }
  }


}

module.exports = Request;
