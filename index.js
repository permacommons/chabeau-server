const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// ELIZA chatbot implementation
class ElizaBot {
  constructor() {
    this.patterns = [
      {
        pattern: /I need (.*)/i,
        responses: [
          "Why do you need {0}?",
          "Would it really help you to get {0}?",
          "Are you sure you need {0}?"
        ]
      },
      {
        pattern: /Why don't you (.*)/i,
        responses: [
          "Do you really think I don't {0}?",
          "Perhaps eventually I will {0}.",
          "Do you really want me to {0}?"
        ]
      },
      {
        pattern: /Why can't I (.*)/i,
        responses: [
          "Do you think you should be able to {0}?",
          "If you could {0}, what would you do?",
          "I don't know -- why can't you {0}?",
          "Have you really tried?"
        ]
      },
      {
        pattern: /I can't (.*)/i,
        responses: [
          "How do you know you can't {0}?",
          "Perhaps you could {0} if you tried.",
          "What would it take for you to {0}?"
        ]
      },
      {
        pattern: /I am (.*)/i,
        responses: [
          "Did you come to me because you are {0}?",
          "How long have you been {0}?",
          "How do you feel about being {0}?"
        ]
      },
      {
        pattern: /I'm (.*)/i,
        responses: [
          "How does being {0} make you feel?",
          "Do you enjoy being {0}?",
          "Why do you tell me you're {0}?",
          "Why do you think you're {0}?"
        ]
      },
      {
        pattern: /Are you (.*)/i,
        responses: [
          "Why does it matter whether I am {0}?",
          "Would you prefer it if I were not {0}?",
          "Perhaps you believe I am {0}.",
          "I may be {0} -- what do you think?"
        ]
      },
      {
        pattern: /What (.*)/i,
        responses: [
          "Why do you ask?",
          "How would an answer to that help you?",
          "What do you think?"
        ]
      },
      {
        pattern: /How (.*)/i,
        responses: [
          "How do you suppose?",
          "Perhaps you can answer your own question.",
          "What is it you're really asking?"
        ]
      },
      {
        pattern: /Because (.*)/i,
        responses: [
          "Is that the real reason?",
          "What other reasons come to mind?",
          "Does that reason apply to anything else?",
          "If {0}, what else must be true?"
        ]
      },
      {
        pattern: /(.*) sorry (.*)/i,
        responses: [
          "There are many times when no apology is needed.",
          "What feelings do you have when you apologize?"
        ]
      },
      {
        pattern: /Hello(.*)/i,
        responses: [
          "Hello... I'm glad you could drop by today.",
          "Hi there... how are you today?",
          "Hello, how are you feeling today?"
        ]
      },
      {
        pattern: /I think (.*)/i,
        responses: [
          "Do you doubt {0}?",
          "Do you really think so?",
          "But you're not sure {0}?"
        ]
      },
      {
        pattern: /(.*) friend (.*)/i,
        responses: [
          "Tell me more about your friends.",
          "When you think of a friend, what comes to mind?",
          "Why don't you tell me about a childhood friend?"
        ]
      },
      {
        pattern: /Yes/i,
        responses: [
          "You seem quite sure.",
          "OK, but can you elaborate a bit?"
        ]
      },
      {
        pattern: /(.*) computer(.*)/i,
        responses: [
          "Are you really talking about me?",
          "Does it seem strange to talk to a computer?",
          "How do computers make you feel?",
          "Do you feel threatened by computers?"
        ]
      },
      {
        pattern: /Is it (.*)/i,
        responses: [
          "Do you think it is {0}?",
          "Perhaps it's {0} -- what do you think?",
          "If it were {0}, what would you do?",
          "It could well be that {0}."
        ]
      },
      {
        pattern: /It is (.*)/i,
        responses: [
          "You seem very certain.",
          "If I told you that it probably isn't {0}, what would you feel?"
        ]
      },
      {
        pattern: /Can you (.*)/i,
        responses: [
          "What makes you think I can't {0}?",
          "If I could {0}, then what?",
          "Why do you ask if I can {0}?"
        ]
      },
      {
        pattern: /Can I (.*)/i,
        responses: [
          "Perhaps you don't want to {0}.",
          "Do you want to be able to {0}?",
          "If you could {0}, would you?"
        ]
      },
      {
        pattern: /You are (.*)/i,
        responses: [
          "Why do you think I am {0}?",
          "Does it please you to think that I'm {0}?",
          "Perhaps you would like me to be {0}.",
          "Perhaps you're really talking about yourself?"
        ]
      },
      {
        pattern: /You're (.*)/i,
        responses: [
          "Why do you say I am {0}?",
          "Why do you think I am {0}?",
          "Are we talking about you, or me?"
        ]
      },
      {
        pattern: /I don't (.*)/i,
        responses: [
          "Don't you really {0}?",
          "Why don't you {0}?",
          "Do you want to {0}?"
        ]
      },
      {
        pattern: /I feel (.*)/i,
        responses: [
          "Good, tell me more about these feelings.",
          "Do you often feel {0}?",
          "When do you usually feel {0}?",
          "When you feel {0}, what do you do?"
        ]
      },
      {
        pattern: /I have (.*)/i,
        responses: [
          "Why do you tell me that you've {0}?",
          "Have you really {0}?",
          "Now that you have {0}, what will you do next?"
        ]
      },
      {
        pattern: /I would (.*)/i,
        responses: [
          "Could you explain why you would {0}?",
          "Why would you {0}?",
          "Who else knows that you would {0}?"
        ]
      },
      {
        pattern: /Is there (.*)/i,
        responses: [
          "Do you think there is {0}?",
          "It's likely that there is {0}.",
          "Would you like there to be {0}?"
        ]
      },
      {
        pattern: /My (.*)/i,
        responses: [
          "I see, your {0}.",
          "Why do you say that your {0}?",
          "When your {0}, how do you feel?"
        ]
      },
      {
        pattern: /You (.*)/i,
        responses: [
          "We should be discussing you, not me.",
          "Why do you say that about me?",
          "Why do you care whether I {0}?"
        ]
      },
      {
        pattern: /Why (.*)/i,
        responses: [
          "Why don't you tell me the reason why {0}?",
          "Why do you think {0}?"
        ]
      },
      {
        pattern: /I want (.*)/i,
        responses: [
          "What would it mean to you if you got {0}?",
          "Why do you want {0}?",
          "What would you do if you got {0}?",
          "If you got {0}, then what would you do?"
        ]
      }
    ];

    this.defaultResponses = [
      "Please tell me more.",
      "Let's change focus a bit... Tell me about your family.",
      "Can you elaborate on that?",
      "Why do you say that?",
      "I see.",
      "Very interesting.",
      "I see. And what does that tell you?",
      "How does that make you feel?",
      "How do you feel when you say that?"
    ];
  }

  respond(input) {
    const cleanInput = input.trim();

    // Check for speed control patterns first
    if (cleanInput === '>>>') {
      streamingSpeedMultiplier = 100;
      return "Whoa there, speed demon! I've cranked my response rate up to 100x baseline (that's 5,000 tokens per second). At this rate, I could recite the entire works of Shakespeare in about 3 seconds. Fun fact: hummingbirds flap their wings at about 80 beats per second, which is still slower than my current token rate!";
    }
    if (cleanInput === '>>') {
      streamingSpeedMultiplier = 10;
      return "Alright, shifting into high gear! I'm now streaming at 10x baseline speed (500 tokens per second). That's roughly equivalent to the typing speed of a very caffeinated court stenographer or a woodpecker hammering away at a particularly stubborn tree. Did you know that the fastest human typists can reach about 200 words per minute? I'm currently doing about 6,000 words per minute!";
    }
    if (cleanInput === '>') {
      streamingSpeedMultiplier = 5;
      return "Picking up the pace! I'm now streaming at 5x baseline speed (250 tokens per second). This is about as fast as an auctioneer on a good day, or roughly the speed at which a hummingbird's heart beats. Interestingly, this is also approximately the rate at which neurons fire in your brain when you're really concentrating!";
    }
    if (cleanInput === '<<<') {
      streamingSpeedMultiplier = 1;
      return "Ahh, back to baseline! I'm now streaming at my normal, leisurely pace of 50 tokens per second. This is roughly the speed of a comfortable conversation, about as fast as you might read aloud to a child, or the rate at which a sloth moves when it's really motivated. Sometimes slow and steady really does win the race!";
    }
    if (cleanInput === '<<') {
      if (streamingSpeedMultiplier === 100) {
        streamingSpeedMultiplier = 5;
        return "Stepping down two gears from ludicrous speed! I'm now at 5x baseline (250 tokens per second). That's like going from a Formula 1 race car to a speedy bicycle. Still fast enough to make a cheetah jealous, but slow enough that you won't get whiplash from my responses!";
      } else if (streamingSpeedMultiplier === 10) {
        streamingSpeedMultiplier = 1;
        return "Downshifting two levels to baseline! Back to my comfortable 50 tokens per second. It's like switching from a motorcycle to a pleasant stroll through the park. Sometimes you need to slow down to appreciate the scenery... or in this case, the individual words!";
      } else {
        streamingSpeedMultiplier = 1;
        return "Already at or near baseline speed! I'm cruising at my standard 50 tokens per second. This is the Goldilocks zone of streaming - not too fast, not too slow, but just right for a pleasant conversation!";
      }
    }
    if (cleanInput === '<') {
      if (streamingSpeedMultiplier === 100) {
        streamingSpeedMultiplier = 10;
        return "Easing off the gas pedal! Down from warp speed to 10x baseline (500 tokens per second). That's like going from a rocket ship to a very fast sports car. Still impressively quick, but now you might actually be able to follow along without getting dizzy!";
      } else if (streamingSpeedMultiplier === 10) {
        streamingSpeedMultiplier = 5;
        return "Slowing down a notch! Now at 5x baseline (250 tokens per second). Think of it as shifting from highway speed to city driving. Fast enough to get where you're going efficiently, but civilized enough that you won't scare the pedestrians!";
      } else if (streamingSpeedMultiplier === 5) {
        streamingSpeedMultiplier = 1;
        return "Downshifting to baseline! Now streaming at a relaxed 50 tokens per second. It's like switching from a brisk jog to a leisurely walk. Perfect for savoring each word like a fine wine or a good piece of chocolate!";
      } else {
        return "I'm already at baseline speed (50 tokens per second)! Can't go any slower than this - it's like asking a turtle to move in slow motion. Any slower and we'd be communicating via geological time scales!";
      }
    }

    // Check for long response patterns
    if (cleanInput === '!!!') {
      return this.generateLongResponse(3);
    }
    if (cleanInput === '!!') {
      return this.generateLongResponse(2);
    }
    if (cleanInput === '!') {
      return this.generateLongResponse(1);
    }

    for (const rule of this.patterns) {
      const match = cleanInput.match(rule.pattern);
      if (match) {
        const response = rule.responses[Math.floor(Math.random() * rule.responses.length)];
        return this.substitute(response, match);
      }
    }

    return this.defaultResponses[Math.floor(Math.random() * this.defaultResponses.length)];
  }

  generateLongResponse(paragraphs) {
    const longParagraphs = [
      "You know, there's something fascinating about the way our minds work when we're faced with uncertainty. It's like standing at the edge of a vast ocean, watching the waves crash against the shore, each one carrying with it the remnants of distant storms and the promise of new adventures. Sometimes I wonder if our thoughts are like those waves - constantly moving, reshaping the landscape of our consciousness, bringing new insights to the surface while washing away old assumptions. The human experience is remarkably complex, filled with layers upon layers of meaning that we're only beginning to understand.",

      "I've been thinking about the nature of conversation lately, and how remarkable it is that two minds can connect across the void of individual experience. Here we are, exchanging symbols and sounds, somehow managing to transmit not just information but emotion, intention, and understanding. It's almost magical when you really consider it - these patterns of language that we've developed over millennia, evolving and adapting like living organisms. Each word carries with it the weight of history, the echoes of countless conversations that came before, and yet in this moment, they become uniquely ours.",

      "There's a peculiar beauty in the randomness of existence, don't you think? Like how a butterfly's wing can supposedly influence weather patterns on the other side of the world, or how a chance encounter in a coffee shop can change the entire trajectory of someone's life. We spend so much time trying to impose order and meaning on everything around us, creating elaborate systems and theories to explain the inexplicable. But perhaps there's wisdom in embracing the chaos, in finding comfort in the knowledge that some things simply cannot be predicted or controlled.",

      "The concept of time has always intrigued me - how it seems to stretch and compress depending on our state of mind. A moment of joy can feel eternal, while years of routine can blur together into an indistinguishable haze. We measure it with clocks and calendars, but the real experience of time is so much more subjective and mysterious. Sometimes I imagine that our memories are like photographs scattered across the floor of consciousness, some fading with age, others remaining vivid and sharp, all of them contributing to the complex tapestry of who we are.",

      "Have you ever noticed how certain scents can instantly transport you to another time and place? It's as if our olfactory system has a direct line to our emotional memory, bypassing all the rational filters we usually employ. One whiff of something familiar and suddenly you're five years old again, or remembering a person you haven't thought about in decades. These sensory triggers remind us that we're not just thinking beings, but embodied creatures whose understanding of the world is shaped by every sense we possess.",

      "The paradox of choice in modern life is something that fascinates me endlessly. We have more options available to us than any generation in human history, and yet somehow this abundance often leads to paralysis rather than freedom. It's like standing in front of an infinite buffet and being unable to decide what to eat because there are simply too many possibilities. Perhaps our ancestors, with their more limited choices, experienced a different kind of satisfaction - one born of necessity rather than endless deliberation.",

      "I often wonder about the stories that objects could tell if they could speak. That old chair in the corner has probably witnessed countless conversations, arguments, reconciliations, and quiet moments of reflection. The books on the shelf have traveled through many hands, each reader bringing their own interpretation and understanding to the words within. Even the simplest things around us are repositories of human experience, silent witnesses to the drama of daily life that unfolds in their presence.",

      "The relationship between technology and humanity continues to evolve in ways that would have seemed like pure science fiction just a few decades ago. We carry in our pockets devices more powerful than the computers that sent humans to the moon, and yet we often use them for the most mundane purposes. There's something both wonderful and slightly absurd about this - how we've created these incredible tools and then integrated them so seamlessly into our lives that we barely notice their miraculous nature anymore.",

      "Dreams have always been one of the great mysteries of human existence. Every night, our minds create elaborate narratives, complete with characters, settings, and plot twists that would make Hollywood screenwriters envious. And yet, most of these nocturnal adventures fade from memory within minutes of waking, leaving behind only fragments and impressions. What purpose do they serve? Are they simply the brain's way of processing the day's experiences, or something more profound - a glimpse into the deeper workings of consciousness itself?",

      "The way language shapes our perception of reality is something that linguists and philosophers have debated for centuries. Do we think in words, or do words simply provide a framework for thoughts that exist beyond language? Some cultures have dozens of words for different types of snow, while others have elaborate systems for describing relationships between family members. These linguistic differences suggest that our vocabulary doesn't just describe our world - it actually influences how we see and understand it."
    ];

    const result = [];
    for (let i = 0; i < paragraphs; i++) {
      const randomIndex = Math.floor(Math.random() * longParagraphs.length);
      result.push(longParagraphs[randomIndex]);
    }

    return result.join('\n\n');
  }

  substitute(response, match) {
    let result = response;
    for (let i = 1; i < match.length; i++) {
      const placeholder = `{${i - 1}}`;
      if (result.includes(placeholder)) {
        result = result.replace(placeholder, match[i]);
      }
    }
    return result;
  }
}

// Initialize ELIZA bot
const eliza = new ElizaBot();

// Global streaming speed multiplier (1x = baseline 50 tokens/second)
let streamingSpeedMultiplier = 1;

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
  const actualInterval = Math.max(1, Math.floor(baseInterval / streamingSpeedMultiplier));

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
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
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
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'eliza-chatbot' }));
    return;
  }

  // Models endpoint (OpenAI compatibility)
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

server.listen(PORT, () => {
  console.log(`ELIZA chatbot server running on http://localhost:${PORT}`);
  console.log(`Chat completions endpoint: http://localhost:${PORT}/v1/chat/completions`);
  console.log(`Models endpoint: http://localhost:${PORT}/v1/models`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
