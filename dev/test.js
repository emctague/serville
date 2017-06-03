// A testing server script for Serville.
let Serville = require('./serville');

// Make a new Serville server on port 8080.
let app = Serville().listen(8080, () => {
  console.log('Listening on :8080.');
});

app.log((msg) => console.log(`e: ${msg}`));
app._log('Test Message');

// Handle Node HTTP errors.
app.catch((err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

app.at('/', () => ({ message: 'Hello!' }));

// This path echoes the request data provided.
app.at('/echo/:sometext/:othertext/?', (q) => {
  return q;
});

// Triggers an exception (to test logging.)
app.at('/error/exception', () => {
  throw 'hey there!';
});

// Triggers a programmer error (to test logging.)
app.at('/error/code', () => {
  null();
});

// This path responds after a delay in seconds, using promises.
app.at('/delay/:secs/?', (q) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ result: 'DONE', time: q.params.secs });
    }, q.params.secs * 1000);
  });
});

app.at('/agent', (q) => ({ agent: q.headers['user-agent'] }));
