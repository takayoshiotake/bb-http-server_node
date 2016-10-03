'use strict';

var bbhttpserver = require('./')

const port = 8080
const address = '127.0.0.1'

bbhttpserver.run(__dirname, port, address)

console.log('Available on:')
console.log(`  http://${address}:${port}/`)
