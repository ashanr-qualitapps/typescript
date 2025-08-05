import * as http from 'http';

class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet(): string {
    return `Hello, ${this.greeting}!`;
  }
}

// Create an HTTP server to keep the application running
const server = http.createServer((req, res) => {
  const greeter = new Greeter("world");
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(greeter.greet());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
