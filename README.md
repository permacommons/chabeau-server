# Chabeau Server

A lightweight Node.js server providing an ELIZA chatbot through an OpenAI-compatible API. Perfect for testing chatbot applications without requiring an actual LLM.

## Quick Start

```bash
npm install
npm start
```

Server runs on `http://localhost:3000` (set `PORT` environment variable to customize).

## Features

### OpenAI-Compatible API

- **Chat Completions:** `POST /v1/chat/completions`
- **Model Listing:** `GET /v1/models`
- **Health Check:** `GET /health`

Authentication is handled via bearer token (`Authorization: Bearer <any-token>`). Use "badtoken" to test authentication failures.

### Content Generation

The server can generate a wide variety of content for testing purposes:

| Feature                      | Commands          | Description                                             |
| ---------------------------- | ----------------- | ------------------------------------------------------- |
| **Long Responses**           | `!`, `!!`, `!!!`    | Generates one to three paragraphs of text.              |
| **Code Blocks**              | `@`, `@@`, `@@@`    | Generates one, three, or five code blocks.              |
| **Markdown Tables**          | `|`, `||`, `|||`    | Generates one to four Markdown tables.                  |
| **Links**                    | `%`, `%%`, `%%%`    | Generates text with various types of links.             |
| **Rich Markdown**            | `$`, `$$`, `$$$`    | Generates paragraphs with rich Markdown formatting.     |
| **Complex Emoji**            | `&`, `&&`, `&&&`    | Generates text with complex, multi-character emoji.     |
| **International Text**       | `~`, `~~`, `~~~`    | Generates text in various non-English languages.        |

### ELIZA Chatbot

The server's core is a classic ELIZA implementation that recognizes and responds to common conversational patterns, such as:

- **Needs:** "I need..." → "Why do you need...?"
- **Feelings:** "I feel..." → "Tell me more about these feelings."
- **Questions:** "Why..." → "Why don't you tell me the reason why...?"
- **Statements:** "I am..." → "How long have you been...?"

### Server Control

- **Streaming Speed:** Control the response speed with `>` (faster) and `<` (slower) commands.
- **Request Latency:** Adjust the server's response time with `)` (slower) and `(` (faster) commands.
- **API Debugging:** Use `system` to inspect the system prompt and `raw` to view the raw API payload.

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

## Development

The server uses minimal dependencies:

- **`smol-toml`** - TOML configuration file parsing
- Node.js built-in modules (`http`, `url`, `fs`, `path`)

### Testing

To run the test suite:

```bash
npm test
```

You can also run tests in watch mode:

```bash
npm run test:watch
```

### Modifying the Server

**ELIZA Patterns:** Edit the `patterns` array in the `ElizaBot` class within `eliza-bot.js`.

**Test Content:** Add files to appropriate directories under `test-content/`. For detailed information, see the [Content Management Guide](CONTENT_MANAGEMENT.md).

**API Endpoints:** Modify the request handling logic in `server.js`.

**Server Configuration:** Update the startup logic in `index.js`.

**Content System:** Modify `lib/content-manager.js` for content loading behavior or `test-content/config.toml` for content settings.

## License

[CC0-1.0](LICENSE) - Public Domain
