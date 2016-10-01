((args) => {
  const fs = require('fs')

  console.log(args)
  try {
    if (args.method == 'GET') {
      var data = fs.readFileSync('assets/index.html', 'utf8')

      data = data.replace(/\$\{template\.args\}/g, JSON.stringify(args))
      data = data.replace(/\$\{template\.process\.version\}/g, process.version)

      return {'status' : 200, 'header': {'Content-Type': 'text/html'}, 'data': data}
    }
    else {
      return {'status' : 400}
    }
  }
  catch (err) {
    return {'status' : 500}
  }
})
