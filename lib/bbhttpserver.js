/**
 * bb-http-server
 */

'use strict';

var http = require('http')
var url = require('url')
var path = require("path")
var fs = require('fs')

exports.run = function(dirname, port, address) {
  const public_dirname = path.join(dirname, 'public/')
  const assets_dirname = path.join(dirname, 'assets/')

  function default_content_for_status(status) {
    try {
      const data = fs.readFileSync(`${assets_dirname}${status}.html`)
      return {'status': status, 'header': {'Content-Type': 'text/html'}, 'data': data}
    }
    catch (err) {
      return {'status': status, 'header': {'Content-Type': 'text/plain'}, 'data': `${status} ${http.STATUS_CODES[status]}`}
    }
  }

  function respond(req, res, body) {
    const parsed_url = url.parse(req.url)
    var filepath = path.join(public_dirname, parsed_url.pathname)
    if (!filepath.startsWith(public_dirname)) {
      const content = default_content_for_status(403)
      res.writeHead(content.status, content.header)
      res.end(content.data)
    }
    try {
      if (fs.statSync(filepath).isDirectory()) {
        if (parsed_url.pathname.slice(-1) != '/') {
          if (parsed_url.query) {
            res.writeHead(302, {'Location': parsed_url.pathname + '/?' + parsed_url.query})
          }
          else {
            res.writeHead(302, {'Location': parsed_url.pathname + '/'})
          }
          res.end()
          return
        }

        var provisional = path.join(filepath, 'index.cgi.js')
        try {
          fs.accessSync(provisional, fs.constants.F_OK)
        }
        catch (err) {
          provisional = path.join(filepath, 'index.html')
        }
        filepath = provisional
      }
      else {
        fs.accessSync(filepath, fs.constants.F_OK)
      }
    }
    catch (err) {
      const content = default_content_for_status(404)
      res.writeHead(content.status, content.header)
      res.end(content.data)
      return
    }

    fs.readFile(filepath, 'binary', (err, data) => {
      if (err) {
        console.log(err)
        const content = default_content_for_status(500)
        res.writeHead(content.status, content.header)
        res.end(content.data)
        return
      }
      if (filepath.endsWith('.cgi.js')) {
        let args = {
          'script': filepath,
          'headers': req.headers,
          'method': req.method,
          'body': Buffer.concat(body).toString(),
          'url': parsed_url,
        } // bridge values to script
        try {
          // HACK: eval(data) returns a function; call function with args.
          var content = eval(data)(args)
          if (content.data) {
            res.writeHead(content.status, content.header)
            res.end(content.data, 'binary')
          }
          else {
            content = default_content_for_status(content.status)
            res.writeHead(content.status, content.header)
            res.end(content.data)
          }
        }
        catch (err) {
          console.log(err)
          const content = default_content_for_status(500)
          res.writeHead(content.status, content.header)
          res.end(content.data)
        }
      }
      else {
        res.writeHead(200, {})
        res.end(data, 'binary')
      }
    })
  }

  http.createServer((req, res) => {
    var body = []
    req.on('error', (err) => {
      console.log(err)
    }).on('data', (chunk) => {
      body.push(chunk)
    }).on('end', () => {
      respond(req, res, body)
    })
  }).listen(port, address)
}
