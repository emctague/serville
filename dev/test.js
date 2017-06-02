// A testing server script for Serville.
let Serville = require('./index');

// Make a new Serville server on port 8080.
let app = Serville().listen(8080, () => {
  console.log("Listening on :8080.");
});

// Handle Node HTTP errors.
app.catch((err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

app.at('/', (q) => ({ message: "Hello!" }));

// This path echoes the request data provided.
app.at('/echo/:sometext/?', (q) => {
  return q;
});

// This path responds after a delay in seconds, using promises.
app.at('/delay/:secs/?', (q) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ result: "DONE", time: q.params.secs });
    }, q.params.secs * 1000);
  })
});

app.at('/agent', (q) => ({ agent: q.headers['user-agent'] }));
