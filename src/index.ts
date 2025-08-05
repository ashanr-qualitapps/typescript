import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet(): string {
    return `Hello, ${this.greeting}!`;
  }
}

// Create an HTTP server with routing
const server = http.createServer((req, res) => {
  const url = req.url || '/';
  
  // Basic routing
  if (url === '/') {
    // Serve the index page
    serveHtmlFile('index.html', res);
  } else if (url === '/type-fundamentals') {
    serveHtmlFile('type-fundamentals.html', res);
  } else if (url === '/advanced-types') {
    serveHtmlFile('advanced-types.html', res);
  } else {
    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

function serveHtmlFile(filename: string, res: http.ServerResponse) {
  const filePath = path.join(__dirname, 'examples', filename);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
