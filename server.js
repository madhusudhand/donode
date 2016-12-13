const http = require('http');
const url = require('url');
const querystring = require('querystring');

const server = http.createServer();

server.on('request', (req, res) => {
    // console.log(req.url);
    // console.log(url.parse(req.url, true));
    // for (var i in req) {
    //   console.log(i + ' -- ' + typeof req[i]);
    // }

    console.log(req.method);
    // console.log(req.headers);

    if (req.method == 'POST') {
        var body = '';

        req.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                req.connection.destroy();
        }).on('end', function () {
            var post = querystring.parse(body);
            console.log(post);
            // use post['blah'], etc.
        });
    }

    res.writeHead(200, {'Content-Type': 'text/json; charset=UTF-8'});
    res.end(JSON.stringify({ res: 'hello' }));
  })

module.exports = server;
