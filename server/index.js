const express = require('express');
const app = express();

const port = 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Routes
app.get('/api/chat', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ message: 'Connected to chat stream' })}\n\n`);

  // Simulate sending messages every 2 seconds
  const intervalId = setInterval(() => {
    const message = {
      time: new Date().toISOString(),
      message: 'Server message: ' + Math.random().toString(36).substring(7)
    };
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  }, 2000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(intervalId);
  });
});

app.get('/ping', (req, res) => {
  res.sendStatus(200);
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
