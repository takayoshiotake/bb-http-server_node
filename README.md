# bb-http-server_node

![version](http://img.shields.io/badge/ver.-0.0.4-blue.svg?style=flat
)
![node](http://img.shields.io/badge/node-v6.7.0-green.svg?style=flat
)
![npm](http://img.shields.io/badge/npm-v3.10.5-green.svg?style=flat
)


This is a simple HTTP server runs on nodejs.  
Web contents such as "http://host/index.cgi.js", are operated as CGI on nodejs.

Image

```
      request
USER ----------> http://host/<path>
                  |
                  | map
       response   v
USER <---------- ${dirname}/public/<path>  // if the path ends with ".cgi.js", the script file is operated.
```

## Demo

```bash
$ git clone https://github.com/takayoshiotake/bb-http-server-sample_node.git bb-http-server-sample
$ cd bb-http-server-sample
$ npm install
$ npm start
```

Access [http://127.0.0.1:8080](http://127.0.0.1:8080)
