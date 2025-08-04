# ELIZA Chatbot Server

A simple Node.js server that provides an ELIZA chatbot through an OpenAI-compatible API. This server is designed for testing chatbots built against the OpenAI API without requiring an actual LLM.

## Features

- **OpenAI-compatible API**: Implements `/v1/chat/completions` and `/v1/models` endpoints
- **ELIZA chatbot**: Classic psychotherapist chatbot with pattern-based responses
- **Streaming support**: Supports both streaming and non-streaming responses
- **Token-based authentication**: Accepts any token except "badtoken"
- **CORS enabled**: Ready for web applications
- **Minimal dependencies**: Uses only Node.js built-in modules

## Installation

```bash
npm install
```

## Usage

Start the server:

```bash
npm start
```

The server will run on `http://localhost:3000` by default. You can set a custom port using the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## API Endpoints

### Chat Completions
`POST /v1/chat/completions`

OpenAI-compatible chat completions endpoint.

**Headers:**
- `Authorization: Bearer <token>` (any token except "badtoken")
- `Content-Type: application/json`

**Request Body:**
```json
{
  "model": "eliza-1.0",
  "messages": [
    {"role": "user", "content": "Hello, how are you?"}
  ],
  "stream": false
}
```

**Response (non-streaming):**
```json
{
  "id": "chatcmpl-1234567890",
  "object": "chat.completion",
  "created": 1677610602,
  "model": "eliza-1.0",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello... I'm glad you could drop by today."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

**Streaming Response:**
Set `"stream": true` in the request to receive Server-Sent Events at ~50 tokens per second.

### Models
`GET /v1/models`

Returns available models.

**Response:**
```json
{
  "object": "list",
  "data": [{
    "id": "eliza-1.0",
    "object": "model",
    "created": 1677610602,
    "owned_by": "eliza-org"
  }]
}
```

### Health Check
`GET /health`

Simple health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "eliza-chatbot"
}
```

## Authentication

The server expects an `Authorization: Bearer <token>` header. Any token is accepted except for "badtoken", which will return a 401 error. This allows you to test both successful and failed authentication scenarios.

## Example Usage

### Using curl (non-streaming):
```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "model": "eliza-1.0",
    "messages": [{"role": "user", "content": "I feel sad today"}],
    "stream": false
  }'
```

### Using curl (streaming):
```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "model": "eliza-1.0",
    "messages": [{"role": "user", "content": "I feel sad today"}],
    "stream": true
  }'
```

### Using JavaScript:
```javascript
const response = await fetch('http://localhost:3000/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token'
  },
  body: JSON.stringify({
    model: 'eliza-1.0',
    messages: [{ role: 'user', content: 'Hello!' }],
    stream: false
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

## ELIZA Patterns

The ELIZA chatbot recognizes various patterns and responds accordingly:

- **Needs**: "I need..." → "Why do you need...?"
- **Feelings**: "I feel..." → "Tell me more about these feelings."
- **Questions**: "Why..." → "Why don't you tell me the reason why...?"
- **Statements**: "I am..." → "How long have you been...?"
- And many more classic ELIZA patterns

## Testing Features

For testing chatbot clients, especially features like "re-generate reply", the server includes special commands that generate long, entertaining responses:

- **`!`** - Generates a single long paragraph (~85 tokens)
- **`!!`** - Generates two long paragraphs (~170 tokens)
- **`!!!`** - Generates three long paragraphs (~260 tokens)

These responses are randomly selected from a pool of philosophical and entertaining paragraphs, ensuring variety when testing re-generation functionality. Each response is different due to the randomness, making them perfect for testing chatbot client features.

### Streaming Speed Control

For testing streaming performance and UI responsiveness, the server includes speed control commands:

- **`>`** - Increases streaming speed to 5x baseline (250 tokens/second)
- **`>>`** - Increases streaming speed to 10x baseline (500 tokens/second)
- **`>>>`** - Increases streaming speed to 100x baseline (5,000 tokens/second)
- **`<`** - Decreases streaming speed by one level (never below baseline)
- **`<<`** - Decreases streaming speed by two levels (never below baseline)
- **`<<<`** - Resets streaming speed to baseline (50 tokens/second)

These commands provide funny, factual responses while adjusting the global streaming speed for all subsequent requests. Perfect for testing how your chatbot client handles different streaming rates.

### Initial Request Latency Control

For testing how your chatbot client handles varying initial request latencies, the server includes latency control commands:

- **`)`** - Increases initial request latency to 500ms
- **`))`** - Increases initial request latency to 2.5 seconds
- **`)))`** - Increases initial request latency to 5 seconds (maximum)
- **`(`** - Decreases initial request latency by one level (never below baseline)
- **`((`** - Decreases initial request latency by two levels (never below baseline)
- **`(((`** - Resets initial request latency to baseline (50ms)

These commands allow you to simulate different network conditions and server response times, which is useful for testing loading states and timeout handling in your chatbot client.

### Example Testing Commands:
```bash
# Test single long response
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"model": "eliza-1.0", "messages": [{"role": "user", "content": "!"}], "stream": false}'

# Test streaming with long response
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"model": "eliza-1.0", "messages": [{"role": "user", "content": "!!"}], "stream": true}'

# Set streaming to maximum speed
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"model": "eliza-1.0", "messages": [{"role": "user", "content": ">>>"}], "stream": false}'

# Test fast streaming
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"model": "eliza-1.0", "messages": [{"role": "user", "content": "Hello!"}], "stream": true}'

# Reset to baseline speed
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"model": "eliza-1.0", "messages": [{"role": "user", "content": "<<<"}], "stream": false}'

# Set initial request latency to 2.5 seconds
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"model": "eliza-1.0", "messages": [{"role": "user", "content": "))"}], "stream": false}'

# Test request with high latency
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"model": "eliza-1.0", "messages": [{"role": "user", "content": "Hello!"}], "stream": false}'

# Reset to baseline latency
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"model": "eliza-1.0", "messages": [{"role": "user", "content": "((("}], "stream": false}'
```

## Development

The server uses only Node.js built-in modules (`http` and `url`), so no external dependencies are required.

To modify the ELIZA patterns, edit the `patterns` array in the `ElizaBot` class within `index.js`.

## License

ISC
