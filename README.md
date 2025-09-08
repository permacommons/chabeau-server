# Chabeau Server

A lightweight Node.js server providing an ELIZA chatbot through an OpenAI-compatible API. Perfect for testing chatbot applications without requiring an actual LLM.

## Quick Start

```bash
npm install
npm start
```

Server runs on `http://localhost:3000` (set `PORT` environment variable to customize).

## API Endpoints

### Chat Completions
`POST /v1/chat/completions` - OpenAI-compatible chat endpoint

**Authentication:** `Authorization: Bearer <any-token>` (use "badtoken" to test auth failures)

**Request:**
```json
{
  "model": "eliza-1.0",
  "messages": [{"role": "user", "content": "Hello!"}],
  "stream": false
}
```

**Response:**
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

### Other Endpoints
- `GET /v1/models` - List available models
- `GET /health` - Health check

## Testing Features

### Long Response Generation
- `!` - Single long paragraph (~85 tokens)
- `!!` - Two paragraphs (~170 tokens)
- `!!!` - Three paragraphs (~260 tokens)

Perfect for testing "re-generate reply" functionality with varied content.

### Code Block Generation
- `@` - Single random code block in various programming languages
- `@@` - Three random code blocks in various programming languages
- `@@@` - Five random code blocks in various programming languages

Each code block is formatted as a fenced markdown code block with a brief explanation text. Supported languages include Python, SQL, Bash, JavaScript, HTML, CSS, Java, C++, Go, and Rust.


### Streaming Speed Control
- `>` / `>>` / `>>>` - Increase speed (5x/10x/100x baseline)
- `<` / `<<` / `<<<` - Decrease speed / reset to baseline (50 tokens/sec)

### Request Latency Control
- `)` / `))` / `)))` - Add latency (500ms/2.5s/5s)
- `(` / `((` / `(((` - Reduce latency / reset to baseline (50ms)

## Example Usage

### cURL
```bash
# Basic chat
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"model": "eliza-1.0", "messages": [{"role": "user", "content": "Hello!"}]}'

# Streaming
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"model": "eliza-1.0", "messages": [{"role": "user", "content": "Hello!"}], "stream": true}'
```

### JavaScript
```javascript
const response = await fetch('http://localhost:3000/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token'
  },
  body: JSON.stringify({
    model: 'eliza-1.0',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

## ELIZA Patterns

The chatbot recognizes classic ELIZA patterns:
- **Needs:** "I need..." → "Why do you need...?"
- **Feelings:** "I feel..." → "Tell me more about these feelings."
- **Questions:** "Why..." → "Why don't you tell me the reason why...?"
- **Statements:** "I am..." → "How long have you been...?"

## Development

Built with Node.js built-in modules only (`http`, `url`) - no external dependencies required.

To modify ELIZA patterns, edit the `patterns` array in the `ElizaBot` class within `index.js`.

## License

[CC0-1.0](LICENSE) - Public Domain
