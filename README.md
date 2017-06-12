<h1 align="center">Serville</h1>

---

<p align="center">
  <a href="https://travis-ci.org/emctague/serville"><img src="https://img.shields.io/travis/emctague/serville.svg?style=flat-square" alt="Travis"></a>
  <a href="https://www.npmjs.com/package/serville"><img src="https://img.shields.io/npm/v/serville.svg?style=flat-square" alt="npm"></a>
  <a href="https://spdx.org/licenses/MIT"><img src="https://img.shields.io/npm/l/serville.svg?style=flat-square" alt="MIT license"></a>
  <a href="https://github.com/emctague/serville/issues"><img src="https://img.shields.io/github/issues-raw/emctague/serville.svg?style=flat-square" alt="issues"></a>
  <a href="https://gitter.im/_serville"><img src="https://img.shields.io/gitter/room/_serville/serville.svg?style=flat-square" alt="Gitter"></a>
</p>

Serville is a **fast, tiny, and opinionated** HTTP library for NodeJS.

Serville is **perfect for your REST API** - it serves up JSON, and it does it
well! **It takes just minutes to set it up and give it a whirl.**

**Set It Up:**

```sh
npm i --save serville
```

```js
const app = require('serville')();
app.listen('8080');

app.at('/', (q) => ({ message: "Hello!" }));
// GET localhost:8080/
// => { "message": "Hello!" }
```

**URL Parameters:**

URL parameters can be specified by putting a colon before
their name in the path. Their values will show up later in
the `params` property.

```js
app.at('/say/:text', (q) => ({ text: q.params.text }));
// GET localhost:8080/say/hello
// => { "text": "hello" }
```

**Optional Trailing Slash:**

Want to allow an optional trailing slash at the end of a URL?
Add a question mark after it to make it optional!

```js
app.at('/either/way/?', (q) => ({ message: "Hey there! "}));
// GET localhost:8080/either/way
// => { "message": "Hey there!" }
// GET localhost:8080/either/way/
// => { "message": "Hey there!" }
```

**Returning Promises:**

Instead of returning an object, you can also return a promise.
This is useful for asynchronous operations.

```js
app.at('/delay/:secs', (q) => {
  return new Promise((res) => {
    setTimeout(() => {
      resolve({ result: "DONE" });
    }, q.params.secs * 1000);
  })
});
// GET localhost:8080/delay/10
// (10 second delay)
// => { "result": "done" }
```

**GET and POST queries:**

GET and POST query data is stored in the `query` property.

```js
app.at('/echo', (q) => ({ text: q.query.text }));
// GET localhost:8080/echo?text=Hello!
// => { "text": "Hello!" }
// POST localhost:8080/echo
// POST body: text=Hello!
// => { "text": "Hello!" }
```

**Regular Expression Matching:**

You can also match paths as regular expressions!
The `match` property will contain the results of running
`RegExp.match(path)` with your regex.

```js
app.at(/^\/my-name-is-(.+)$/, (q) => (
  { message: `Hello, ${q.match[1]}!` }
));
// GET localhost:8080/my-name-is-Patricia
// => { "message": "Hello, Patricia!" }
```

**Differentiating request types:**

The `get`, `post`, `put`, and `delete` functions can be used to
add bindings for specific request methods.

```js
app.get('/method', () => ({ message: 'GET request!' }));
app.post('/method', () => ({ message: 'POST request!' }));
// GET localhost:8080/method
// => { "message": "GET request!" }
// POST localhost:8080/method
// => { "message": "POST request!" }
```
You can also specify several methods as a third array argument to `at`.

```js
app.at('/method', () => ({message: 'PUT or DELETE request!'}), ['PUT', 'DELETE']);
// PUT localhost:8080/method
// => { "message": "PUT or DELETE request!" }
// DELETE localhost:8080/method
// => { "message": "PUT or DELETE request!" }
```

By default, all possible methods will be accepted:

```js
app.at('/method', () => ({message: 'Something Else!'}));
// TRACE localhost:8080/method
// => { "message": "Something Else!" }
```

**HTTP Request Headers:**

The HTTP request headers are present in the `headers` property.

```js
app.at('/agent', (q) => ({ agent: q.headers['user-agent'] }));
```

**Handling Node HTTP Server Errors:**

Sometimes, node encounters HTTP errors. Use `catch` to add
a binding for when these errors occur.

```js
app.catch((err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
```

## Notes

 * The NPM package does not include the project sources or certain files from the
   repository. This is to save space.
   If you want to save even more space, simply download `serville.js` and put it
   in your project instead. It's minified!

 * Serville doesn't yet have full code-coverage unit testing and there may be some
   quirks or bugs. If you find anything, please [submit an issue](https://github.com/emctague/serville/issues/new)!

## Contributing

Fork and clone this repository to get started, then run `npm i` to install dev
dependencies.
There's no formal contribution procedure (yet), feel free to submit PRs and issues as you see
fit. Contributions are very much welcomed!

Just note that you can't work directly on the `master` branch, as it is
protected. We recommend editing code on your own branch, then merging into
`develop`. You may only merge with `master` after your PR is approved and
continuous integration checks pass.

The source code for the library is in `lib/serville.js`.
Modify the testing script in `lib/test.js` to try out your changes and new
features. You can run these tests with `npm run dev`.

To build the current version of the server to `serville.js`, simply run `npm run build`.
