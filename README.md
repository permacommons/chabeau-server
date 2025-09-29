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

### Markdown Table Generation
- `|` - Single random markdown table with varied content
- `||` - 2-3 random markdown tables with varied content
- `|||` - 3-4 random markdown tables with varied content

Each table includes different markdown formatting features like complex content, code snippets, links, line breaks, and various table structures for comprehensive testing.

### Link Generation
- `%` - Simple text with plain URLs and basic markdown links
- `%%` - Multiple paragraphs with various link formats and styles
- `%%%` - Complex content including markdown tables with embedded links

Generates content with links in various formats (plain URLs, markdown links in paragraphs, and links within tables) with flavor text inspired by the intersection of Douglas Adams' wit, Ted Nelson's Xanadu vision, and Tim Berners-Lee's web invention.

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

## Server Development

### Content Management System

The server uses a filesystem-based content management system that allows server developers to easily add new test content without modifying the core bot logic.

#### Directory Structure

```
test-content/
├── config.toml                 # Main configuration file
├── code-blocks/                # Programming language examples
│   ├── python/                 # Python code samples
│   ├── javascript/             # JavaScript code samples
│   ├── sql/                    # SQL query examples
│   ├── bash/                   # Shell script examples
│   ├── html/                   # HTML markup examples
│   ├── css/                    # CSS styling examples
│   ├── java/                   # Java code examples
│   ├── cpp/                    # C++ code examples
│   ├── go/                     # Go code examples
│   └── rust/                   # Rust code examples
├── long-responses/             # Extended paragraph content
├── tables/                     # Markdown table examples
└── links/                      # Content with embedded links
```

#### Adding New Content

**Code Blocks:** Add new files to the appropriate language directory under `test-content/code-blocks/`. Files should contain complete, runnable code examples with proper file extensions (`.py`, `.js`, `.sql`, etc.).

**Long Responses:** Add `.txt` files to `test-content/long-responses/`. Each file should contain one coherent paragraph of 80-120 words.

**Tables:** Add `.md` files to `test-content/tables/`. Each file should contain one complete markdown table with headers and data.

**Links:** Add content files to `test-content/links/`. Support plain URLs, markdown links, and table-embedded links.

#### Configuration

The `test-content/config.toml` file controls content categories, command mappings, and system settings. The system automatically discovers new content files without requiring configuration changes.

#### File Organization Standards

- Use descriptive filenames that indicate the content purpose
- Maintain consistent file extensions for each content type
- Organize code blocks by programming language
- Keep content files focused on single examples or concepts
- Ensure all content is properly formatted and readable

## Project Structure

The server is organized into focused, single-responsibility modules:

- **`index.js`** - Main entry point, starts the server
- **`server.js`** - HTTP server logic and API endpoints  
- **`eliza-bot.js`** - ELIZA chatbot implementation using ContentManager
- **`lib/content-manager.js`** - Content loading and management system
- **`lib/config-loader.js`** - TOML configuration file handling
- **`test-content/`** - Filesystem-based content organization
  - **`config.toml`** - Content system configuration
  - **`code-blocks/`** - Programming language examples by language
  - **`long-responses/`** - Extended paragraph content files
  - **`tables/`** - Markdown table examples
  - **`links/`** - Content with various link formats

## Development

### Dependencies

The server uses minimal dependencies:
- **`smol-toml`** - TOML configuration file parsing
- Node.js built-in modules (`http`, `url`, `fs`, `path`)

### Modifying Content

**ELIZA Patterns:** Edit the `patterns` array in the `ElizaBot` class within `eliza-bot.js`.

**Test Content:** Add files to appropriate directories under `test-content/`. The system automatically discovers and loads new content.

**API Endpoints:** Modify the request handling logic in `server.js`.

**Server Configuration:** Update the startup logic in `index.js`.

**Content System:** Modify `lib/content-manager.js` for content loading behavior or `test-content/config.toml` for content settings.

## License

[CC0-1.0](LICENSE) - Public Domain
