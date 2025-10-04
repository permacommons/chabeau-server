// ELIZA chatbot implementation with content generation
import ContentManager from './lib/content-manager.js';

class ElizaBot {
  constructor() {
    // Initialize ContentManager for filesystem-based content
    this.contentManager = new ContentManager('./test-content');
    this.contentLoaded = false;
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

    // Initialize content loading during startup
    this._initializeContent();
  }

  /**
   * Initialize content loading from filesystem
   * @private
   */
  async _initializeContent() {
    try {
      await this.contentManager.loadContent();
      this.contentLoaded = true;
      console.log('ElizaBot: Content loading completed successfully');
    } catch (error) {
      console.error('ElizaBot: Failed to load content. Control commands will return empty output until content files are provided:', error.message);
      this.contentLoaded = false;
    }
  }

  respond(input) {
    const cleanInput = input.trim();

    // Handle control patterns
    const controlResponse = this.handleControlPatterns(cleanInput);
    if (controlResponse !== null && controlResponse !== undefined) {
      return controlResponse;
    }

    // Handle code block generation patterns
    const codeBlockResponse = this.handleCodeBlockPatterns(cleanInput);
    if (codeBlockResponse !== null && codeBlockResponse !== undefined) {
      return codeBlockResponse;
    }

    // Handle ELIZA response patterns
    for (const rule of this.patterns) {
      const match = cleanInput.match(rule.pattern);
      if (match) {
        const response = rule.responses[Math.floor(Math.random() * rule.responses.length)];
        return this.substitute(response, match);
      }
    }

    // Return default response if no patterns match
    return this.defaultResponses[Math.floor(Math.random() * this.defaultResponses.length)];
  }

  substitute(response, match) {
    return response.replace(/{(\d+)}/g, (_, index) => {
      const i = parseInt(index);
      return match[i + 1] || '';
    });
  }

  handleControlPatterns(input) {
    // Speed control patterns
    if (input === '>>>') {
      global.streamingSpeedMultiplier = 100;
      return "Whoa there, speed demon! I've cranked my response rate up to 100x baseline (that's 5,000 tokens per second). At this rate, I could recite the entire works of Shakespeare in about 3 seconds. Fun fact: hummingbirds flap their wings at about 80 beats per second, which is still slower than my current token rate!";
    }
    if (input === '>>') {
      global.streamingSpeedMultiplier = 10;
      return "Alright, shifting into high gear! I'm now streaming at 10x baseline speed (500 tokens per second). That's roughly equivalent to the typing speed of a very caffeinated court stenographer or a woodpecker hammering away at a particularly stubborn tree. Did you know that the fastest human typists can reach about 200 words per minute? I'm currently doing about 6,000 words per minute!";
    }
    if (input === '>') {
      global.streamingSpeedMultiplier = 5;
      return "Picking up the pace! I'm now streaming at 5x baseline speed (250 tokens per second). This is about as fast as an auctioneer on a good day, or roughly the speed at which a hummingbird's heart beats. Interestingly, this is also approximately the rate at which neurons fire in your brain when you're really concentrating!";
    }
    if (input === '<<<') {
      global.streamingSpeedMultiplier = 1;
      return "Ahh, back to baseline! I'm now streaming at my normal, leisurely pace of 50 tokens per second. This is roughly the speed of a comfortable conversation, about as fast as you might read aloud to a child, or the rate at which a sloth moves when it's really motivated. Sometimes slow and steady really does win the race!";
    }
    if (input === '<<') {
      if (global.streamingSpeedMultiplier === 100) {
        global.streamingSpeedMultiplier = 5;
        return "Stepping down two gears from ludicrous speed! I'm now at 5x baseline (250 tokens per second). That's like going from a Formula 1 race car to a speedy bicycle. Still fast enough to make a cheetah jealous, but slow enough that you won't get whiplash from my responses!";
      } else if (global.streamingSpeedMultiplier === 10) {
        global.streamingSpeedMultiplier = 1;
        return "Downshifting two levels to baseline! Back to my comfortable 50 tokens per second. It's like switching from a motorcycle to a pleasant stroll through the park. Sometimes you need to slow down to appreciate the scenery... or in this case, the individual words!";
      } else {
        global.streamingSpeedMultiplier = 1;
        return "Already at or near baseline speed! I'm cruising at my standard 50 tokens per second. This is the Goldilocks zone of streaming - not too fast, not too slow, but just right for a pleasant conversation!";
      }
    }
    if (input === '<') {
      if (global.streamingSpeedMultiplier === 100) {
        global.streamingSpeedMultiplier = 10;
        return "Easing off the gas pedal! Down from warp speed to 10x baseline (500 tokens per second). That's like going from a rocket ship to a very fast sports car. Still impressively quick, but now you might actually be able to follow along without getting dizzy!";
      } else if (global.streamingSpeedMultiplier === 10) {
        global.streamingSpeedMultiplier = 5;
        return "Slowing down a notch! Now at 5x baseline (250 tokens per second). Think of it as shifting from highway speed to city driving. Fast enough to get where you're going efficiently, but civilized enough that you won't scare the pedestrians!";
      } else if (global.streamingSpeedMultiplier === 5) {
        global.streamingSpeedMultiplier = 1;
        return "Downshifting to baseline! Now streaming at a relaxed 50 tokens per second. It's like switching from a brisk jog to a leisurely walk. Perfect for savoring each word like a fine wine or a good piece of chocolate!";
      } else {
        return "I'm already at baseline speed (50 tokens per second)! Can't go any slower than this - it's like asking a turtle to move in slow motion. Any slower and we'd be communicating via geological time scales!";
      }
    }

    // Latency control patterns
    if (input === ')))') {
      global.requestLatency = 5000; // 5 seconds
      return "Wow, I'm feeling really sluggish today! I've set my initial request latency to a whopping 5 seconds. This is like waiting for a computer from the 1980s to boot up, or watching paint dry in slow motion. Fun fact: a sloth moves at about 0.24 kilometers per hour, but at this latency, I'm moving slower than even their internet connection would be!";
    }
    if (input === '))') {
      global.requestLatency = 2500; // 2.5 seconds
      return "Feeling a bit sluggish now! I've increased my initial request latency to 2.5 seconds. That's about as long as it takes to brew a cup of tea or read a short poem. Did you know that the average human attention span is about 8 seconds? At this rate, I'm testing the limits of your patience!";
    }
    if (input === ')') {
      global.requestLatency = 500; // 0.5 seconds
      return "Adding a little delay to my responses! I've set my initial request latency to 500 milliseconds. This is about the time it takes for a human to blink their eyes or for a computer to process a simple command. Interestingly, a housefly's nervous system can process visual information in about 30 milliseconds, so I'm still much slower than a fly's reaction time!";
    }
    if (input === '(((') {
      global.requestLatency = 50; // back to baseline
      return "Back to my normal speed! I've reset my initial request latency to the baseline 50 milliseconds. This is about as fast as a human can perceive a delay - any faster and it would feel instantaneous. For comparison, a camera flash typically lasts about 1 millisecond, so I'm still 50 times slower than that!";
    }
    if (input === '((') {
      if (global.requestLatency === 5000) {
        global.requestLatency = 500;
        return "Speeding up a bit! I've reduced my initial request latency from 5 seconds to 500 milliseconds. That's like going from a leisurely stroll to a brisk walk. Still perceptibly delayed, but much more responsive than before!";
      } else if (global.requestLatency === 2500) {
        global.requestLatency = 50;
        return "Much better! I've reduced my initial request latency from 2.5 seconds to the baseline 50 milliseconds. Now I'm back to feeling snappy and responsive, like a modern computer should be!";
      } else {
        global.requestLatency = 50;
        return "I'm already at or near baseline latency (50ms)! Can't get much faster than this - it's like trying to make light travel faster!";
      }
    }
    if (input === '(') {
      if (global.requestLatency === 5000) {
        global.requestLatency = 2500;
        return "Feeling a bit more responsive! I've reduced my initial request latency from 5 seconds to 2.5 seconds. That's still quite slow, but at least it's not glacial anymore. Think of it as going from a glacier's movement to a slow river current!";
      } else if (global.requestLatency === 2500) {
        global.requestLatency = 500;
        return "Getting faster! I've reduced my initial request latency from 2.5 seconds to 500 milliseconds. This is about as long as it takes to clap your hands once - much more reasonable for a chatbot!";
      } else if (global.requestLatency === 500) {
        global.requestLatency = 50;
        return "Back to baseline! I've reduced my initial request latency from 500 milliseconds to the baseline 50 milliseconds. Now I'm responding at a normal, conversational pace!";
      } else {
        return "I'm already at baseline latency (50ms)! Can't go any faster than this - I'm already responding as quickly as a human can perceive!";
      }
    }

    // Long response patterns
    if (input === '!!!') {
      return this.generateLongResponse(3);
    }
    if (input === '!!') {
      return this.generateLongResponse(2);
    }
    if (input === '!') {
      return this.generateLongResponse(1);
    }

    // Markdown table patterns
    if (input === '|||') {
      return this.generateMarkdownTables(4);
    }
    if (input === '||') {
      return this.generateMarkdownTables(3);
    }
    if (input === '|') {
      return this.generateMarkdownTables(1);
    }

    // Rich markdown patterns
    if (input === '$$$') {
      return this.generateRichMarkdown(3);
    }
    if (input === '$$') {
      return this.generateRichMarkdown(2);
    }
    if (input === '$') {
      return this.generateRichMarkdown(1);
    }

    // Link generation patterns
    if (input === '%%%') {
      return this.generateLinkedContent(3);
    }
    if (input === '%%') {
      return this.generateLinkedContent(2);
    }
    if (input === '%') {
      return this.generateLinkedContent(1);
    }

    // Terminal-breaking emoji patterns
    if (input === '&&&') {
      return this.generateTerminalBreakingEmoji(3);
    }
    if (input === '&&') {
      return this.generateTerminalBreakingEmoji(2);
    }
    if (input === '&') {
      return this.generateTerminalBreakingEmoji(1);
    }

    // International text patterns
    if (input === '~~~') {
      return this.generateInternationalText(3);
    }
    if (input === '~~') {
      return this.generateInternationalText(2);
    }
    if (input === '~') {
      return this.generateInternationalText(1);
    }

    // No control pattern matched
    return null;
  }

  handleCodeBlockPatterns(input) {
    // Code block generation patterns
    if (input === '@@@') {
      return this.generateCodeBlocks(5);
    }
    if (input === '@@') {
      return this.generateCodeBlocks(3);
    }
    if (input === '@') {
      return this.generateCodeBlocks(1);
    }

    // No code block pattern matched
    return null;
  }

  generateLongResponse(paragraphs) {
    return this.contentManager.getLongResponse(paragraphs);
  }

  generateCodeBlocks(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
      const codeBlock = this.contentManager.getCodeBlock();
      if (codeBlock) {
        result.push(codeBlock);
      }
    }
    return result.join('\n\n');
  }

  generateMarkdownTables(count) {
    return this.contentManager.getMarkdownTable(count);
  }

  generateRichMarkdown(count) {
    return this.contentManager.getRichMarkdown(count);
  }

  generateLinkedContent(complexity) {
    return this.contentManager.getLinkedContent(complexity);
  }

  generateTerminalBreakingEmoji(count) {
    return this.contentManager.getTerminalBreakingEmoji(count);
  }

  generateInternationalText(count) {
    return this.contentManager.getInternationalText(count);
  }

}

// Global variables for streaming control
global.streamingSpeedMultiplier = 1;
global.requestLatency = 50;

export { ElizaBot };