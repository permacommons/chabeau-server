const { createServer } = require('./server');

const PORT = process.env.PORT || 3000;

// Start server
const server = createServer(PORT);

server.listen(PORT, () => {
  console.log(`Chabeau Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /v1/chat/completions - Chat with ELIZA');
  console.log('  GET  /v1/models - List available models');
  console.log('  GET  /health - Health check');
});