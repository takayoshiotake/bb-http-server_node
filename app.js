const http = require('http')
const url = require('url')
const path = require("path")
const fs = require('fs')

const PORT = 8080
const ADDRESS = '0.0.0.0'

function default_content_for_status(status) {
  try {
    const data = fs.readFileSync(`${__dirname}/assets/${status}.html`)
    return {'status': status, 'header': {'Content-Type': 'text/html'}, 'data': data}
  }
  catch (err) {
    return {'status': status, 'header': {'Content-Type': 'text/plain'}, 'data': `${status} ${http.STATUS_CODES[status]}`}
  }
}

http.createServer((req, res) => {
  const parsed_url = url.parse(req.url)
  var filepath = path.join(__dirname + '/public', parsed_url.pathname)
  try {
    if (fs.statSync(filepath).isDirectory()) {
      var provisional = path.join(filepath, 'index.js')
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
    if (path.extname(filepath) == '.js') {
      let args = {
        'script': filepath,
        'method': req.method,
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
}).listen(PORT, ADDRESS)

console.log('Available on:')
console.log('  http://127.0.0.1:8080/')
