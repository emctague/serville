const http = require('http');
const url = require('url');
const querystring = require('querystring');

/* A tiny HTTP server that matches simple path patterns and serves up JSON data.
 * Copyright 2017 Ethan McTague and Contributors.
 * Licensed under the MIT license.
 */
class Serville {
  constructor () {
    this.bindings = []; // List of all path bindings.

    // Handle HTTP requests.
    this.server = http.createServer((req, res) => {

      // Parse the URL to get the path.
      let parsed = url.parse(req.url, true);
      let path = decodeURIComponent(parsed.pathname);

      // Check for any matching bindings.
      for (var binding of this.bindings) {
        let matches = path.match(binding.at);

        // Use this binding if the path matches and the correct HTTP method is used.
        if (matches !== null && (!binding.types || binding.types.indexOf(req.method) > -1)) {

          // Put the parameters into an object.
          let params = {};
          for (var i in binding.keys)
            params[binding.keys[i]] = matches[parseInt(i) + 1];

          // Wait for all HTTP post data (if any) to arrive.
          let data = '';
          req.on('data', (chunk) => data += chunk);
          req.on('end', () => {

            // Send result to a server (whether promise or not.)
            try {
              // Call the binding.
              let bindCall = binding.cb({
                params: params,
                headers: req.headers,
                query: Object.assign(parsed.query, querystring.parse(data)),
                match: matches
              });

              // Send out the results (Promise-based or return-based.)
              if (bindCall instanceof Promise)
                bindCall.then((result) => {
                  res.end(JSON.stringify(result));
                }).catch((e) => {
                  this._handleBindingError(e, res);
                });
              else
                res.end(JSON.stringify(bindCall));
            } catch (e) {
              this._handleBindingError(e, res);
            }
          });
          return;
        }
      }
      // No bindings matched - serve 404.
      res.statusCode = 404;
      res.end('{ "status": "404", "message": "Endpoint Not Found" }');
    });
  }

  // Handle an error in a binding.
  _handleBindingError (e, res) {
    // Handle errors in the binding code.
    res.statusCode = 500;
    res.end(JSON.stringify({
      status: 'Server Error',
      error: e.message || e
    }));

    // Crash the program - devs should make their server auto-restart.
    // This is safer than continuing to run after errors.
    console.log(e);
    console.log('Fatal binding error, aborting app. Your server should handle automatic restarting.');
    process.exit(1);
  }

  /* Add a new binding at the specified path.
   * Paths can have varying parts, named with a colon, which will be passed
   * as properties to the binding. The path can also be a RegExp.
   * Bindings must return either a promise for output, or the output itself.
   * The 'type' argument is an array specifying the types of HTTP requests
   * this binding can handle (e.g. ['GET', 'POST'].) If left out, the default
   * is any type.
   * The 'req' object passed to the binding as an argument contains:
   *  params: (Object) URL colon property values
   *  query: (Object) GET and POST query values
   *  headers: (Object) HTTP request headers
   *  match: (Array) Raw match results between the location regex and path.
   */
  at (location, cb, types) {
    let rex = false, keys = [];
    if (!(location instanceof RegExp)) {
      // Find parameters (:something).
      let detect = /\/\:([a-zA-Z0-9_]+?)(?=\/|$)/g;
      let keys = location.match(detect) || [];

      // Make the location regex-safe, then add selectors for prop values.
      rex = location.replace(/[\-\[\]\/\{\}\(\)\*\+\.\\\^\$\|]/g, '\\$&');
      for (let key of keys)
        rex = rex.replace(key, '/(.+?)');
    }

    // Add the new binding.
    this.bindings.push({
      at: rex ? new RegExp('^' + rex + '$', 'i') : location,
      keys: keys.map(k => k.substring(2)),
      cb: cb,
      types: types
    });
    return this;
  }

  /* Add a new binding for GET requests.
   * Same as calling at(location, cb, ['GET']).
   */
  get (location, cb) {
    this.at(location, cb, ['GET']);
  }

  /* Add a new binding for POST requests.
   * Same as calling at(location, cb, ['POST']).
   */
  post (location, cb) {
    this.at(location, cb, ['POST']);
  }

  /* Add a new binding for PUT requests.
   * Same as calling at(location, cb, ['PUT']).
   */
  put (location, cb) {
    this.at(location, cb, ['PUT']);
  }

  /* Add a new binding for DELETE requests.
   * Same as calling at(location, cb, ['DELETE']).
   */
  delete (location, cb) {
    this.at(location, cb, ['DELETE']);
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
