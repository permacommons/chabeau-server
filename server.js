const http = require('http');
const url = require('url');
const { ElizaBot } = require('./eliza-bot');

// Initialize ELIZA bot
const eliza = new ElizaBot();

// Helper function to generate streaming response
function streamResponse(res, content, isStreaming = false) {
  const id = `chatcmpl-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);

  if (!isStreaming) {
    // Non-streaming response
    const response = {
      id,
      object: "chat.completion",
      created,
      model: "eliza-1.0",
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: content.split(' ').length,
        total_tokens: 10 + content.split(' ').length
      }
    };

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(response));
    return;
  }

  // Streaming response
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });

  // Split content into tokens (words)
  const tokens = content.split(' ');
  let tokenIndex = 0;

  // Send initial chunk
  const initialChunk = {
    id,
    object: "chat.completion.chunk",
    created,
    model: "eliza-1.0",
    choices: [{
      index: 0,
      delta: {
        role: "assistant",
        content: ""
      },
      finish_reason: null
    }]
  };
  res.write(`data: ${JSON.stringify(initialChunk)}\n\n`);

  // Stream tokens at variable speed based on multiplier
  // Base: 50 tokens/second (20ms per token)
  const baseInterval = 20;
  const actualInterval = Math.max(1, Math.floor(baseInterval / global.streamingSpeedMultiplier));

  const streamInterval = setInterval(() => {
    if (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex] + (tokenIndex < tokens.length - 1 ? ' ' : '');
      const chunk = {
        id,
        object: "chat.completion.chunk",
        created,
        model: "eliza-1.0",
        choices: [{
          index: 0,
          delta: {
            content: token
          },
          finish_reason: null
        }]
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      tokenIndex++;
    } else {
      // Send final chunk
      const finalChunk = {
        id,
        object: "chat.completion.chunk",
        created,
        model: "eliza-1.0",
        choices: [{
          index: 0,
          delta: {},
          finish_reason: "stop"
        }]
      };
      res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      clearInterval(streamInterval);
    }
  }, actualInterval);
}

// Create HTTP server
function createServer(port = 3000) {
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      res.end();
      return;
    }

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
      return;
    }

    // Models endpoint
    if (path === '/v1/models' && method === 'GET') {
      const models = {
        object: "list",
        data: [{
          id: "eliza-1.0",
          object: "model",
          created: 1677610602,
          owned_by: "eliza-org",
          permission: [],
          root: "eliza-1.0",
          parent: null
        }]
      };
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(models));
      return;
    }

    // Chat completions endpoint
    if (path === '/v1/chat/completions' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        // Add initial request latency
        setTimeout(() => {
          try {
            // Check authorization
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: {
                  message: "You didn't provide an API key.",
                  type: "invalid_request_error",
                  code: "invalid_api_key"
                }
              }));
              return;
            }

            const token = authHeader.substring(7);
            if (token === 'badtoken') {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: {
                  message: "Invalid API key provided.",
                  type: "invalid_request_error",
                  code: "invalid_api_key"
                }
              }));
              return;
            }

            const requestData = JSON.parse(body);
            const messages = requestData.messages || [];
            const stream = requestData.stream || false;

            // Get the last user message
            const lastMessage = messages.filter(msg => msg.role === 'user').pop();
            if (!lastMessage) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: {
                  message: "No user message found.",
                  type: "invalid_request_error"
                }
              }));
              return;
            }

            // Generate ELIZA response
            const elizaResponse = eliza.respond(lastMessage.content);

            // Send response (streaming or non-streaming)
            streamResponse(res, elizaResponse, stream);

          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: {
                message: "Invalid JSON in request body.",
                type: "invalid_request_error"
              }
            }));
          }
        }, global.requestLatency);
      });
      return;
    }

    // 404 for other endpoints
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: {
        message: "Not found.",
        type: "invalid_request_error"
      }
    }));
  });

  return server;
}

module.exports = { createServer };