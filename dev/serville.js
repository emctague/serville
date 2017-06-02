const http = require('http');
const url = require('url');
const querystring = require('querystring');

/* A tiny HTTP server that matches simple path patterns and serves up JSON data.
 * Copyright 2017 Ethan McTague and Contributors.
 * Licensed under the MIT license.
 */
class Serville {
  constructor () {
    this.bindings = [];

    // Handle HTTP requests.
    this.server = http.createServer((req, res) => {

      // Parse the URL to get the path.
      let parsed = url.parse(req.url, true);

      // Check for any matching bindings.
      for (var binding of this.bindings)
        if (binding.at.test(parsed.path)) {

          // Put the parameters into an object.
          let params = {};
          let match = parsed.path.match(binding.at);
          for (var i in binding.keys)
            params[binding.keys[i]] = match[parseInt(i) + 1];

          // Wait for all HTTP post data (if any) to arrive.
          let data = "";
          req.on('data', (chunk) => data += chunk);
          req.on('end', () => {

            // Call the binding.
            let bindCall = binding.cb({
              params: params,
              headers: req.headers,
              query: Object.assign(parsed.query, querystring.parse(data))
            });

            // Send result to a server (whether promise or not.)
            if (bindCall instanceof Promise)
              bindCall.then((result) => {
                res.end(JSON.stringify(result));
              });
            else
              res.end(JSON.stringify(bindCall));
          });
          return;
        }

      // No bindings matched - serve 404.
      res.statusCode = 404;
      res.end('{ "status": "404", "message": "Endpoint Not Found" }');
    });
  }

  /* Add a new binding at the specified path.
   * paths can have varying parts, named with a colon, which will be passed
   * as properties to the binding.
   * Bindings must return either a promise for output, or the output itself.
   * The 'req' object passed to the binding as an argument contains:
   *  params: (Object) URL colon property values
   *  query: (Object) GET and POST query values
   *  headers: (Object) HTTP request headers
   */
  at (location, cb) {
    let detect = /\/\:([a-zA-Z0-9_]+?)(?=\/|$)/g;
    let keys = location.match(detect) || [];

    // Make the location regex-safe, then add selectors for prop values.
    let rex = location.replace(/[\-\[\]\/\{\}\(\)\*\+\.\\\^\$\|]/g, "\\$&");
    for (let key of keys)
      rex = rex.replace(key, '/(.+?)');

    // Add the new binding.
    this.bindings.push({
      at: new RegExp('^' + rex + '$', 'i'),
      keys: keys.map(k => k.substring(2)),
      cb: cb
    });
    return this;
  }

  // Bind a Node HTTP server event.
  on (event, cb) {
    this.server.on(event, (err, socket) => cb(err, socket));
    return this;
  }

  // Bind to node HTTP server errors.
  catch (cb) {
    this.on('clientError', cb);
    return this;
  }

  // Listen on the specified port, then call the callback.
  listen (port, cb) {
    this.server.listen(port, cb);
    return this;
  }
}
module.exports = () => new Serville();
