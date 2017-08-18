'use strict';
const fs = require('fs');
const url = require('url');
const path = require('path');
const zlib = require('zlib');

function serveStatic(publicDir) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.eot': 'appliaction/vnd.ms-fontobject',
    '.ttf': 'aplication/font-sfnt'
  };

  return function(request, response, onError) {
    try {
      let pathName = url.parse(request.url).path;
      if (pathName === '/') {
        pathName = '/index.html';
      }
      pathName = pathName.substring(1, pathName.length);

      let extname = path.extname(pathName);
      let staticFiles = `${publicDir}/${pathName}`;

      if (extname =='.jpg' || extname == '.png' || extname == '.ico' || extname == '.eot' || extname == '.ttf' || extname == '.svg') {
        let file = fs.readFileSync(staticFiles);
        response.writeHead(200, {'Content-Type': mimeTypes[extname]});
        response.write(file, 'binary');
        response.end();
      } else {
        // response.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});
        //
        // var text = "Hello World!";
        // zlib.gzip(text, function (_, result) {  // The callback will give you the
        //   response.end(result);                     // result, so just send it.
        // });
        // return;

        fs.readFile(staticFiles, 'utf8', function (err, data) {
          if (!err) {
            const headers = {};
            if (mimeTypes[extname]) {
              headers['Content-Type'] = mimeTypes[extname];
            }

            zlib.gzip(data, (err, zipped) => {
              headers['Content-Encoding'] = 'gzip';
              response.writeHead(200, headers);
              response.end(zipped);
            });
            // response.end(data);

          } else {
            response.writeHead(404, {'Content-Type': 'text/html;charset=utf8'});
            response.write(`<strong>${staticFiles}</strong>File is not found.`);
            response.end();
          }
        });
      }
    } catch (e) {
      console.log('ERROR', e);
      onError(e);
    }
  };
}





module.exports = serveStatic;
