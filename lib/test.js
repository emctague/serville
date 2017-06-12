// A testing server script for Serville.
let Serville = require('./serville');

// Make a new Serville server on port 8080.
let app = Serville().listen(8080, () => {
  console.log('Listening on :8080.');
});

// Handle Node HTTP errors.
app.catch((err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

app.at('/', () => ({ message: 'Hello!' }));

app.get('/rtype', () => ({message: 'GET request!'}));
app.post('/rtype', () => ({message: 'POST request!'}));
app.at('/rtype', () => ({message: 'PUT or DELETE request!'}), ['PUT', 'DELETE']);
app.at('/rtype', () => ({message: 'Something Else!'}));

app.at(/^\/my-name-is-(.+)$/, (q) => {
  return {
    message: `Hello, ${q.match[1]}!`
  };
});

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

// Triggers an error in a promise.
app.at('/error/promise', () => {
  return new Promise(() => {
    throw new Error('A fake error!');
  });
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
