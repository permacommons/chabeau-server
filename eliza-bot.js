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
      console.error('ElizaBot: Failed to load content, will use fallback responses:', error.message);
      this.contentLoaded = false;
    }
  }

  respond(input) {
    const cleanInput = input.trim();

    // Handle control patterns
    const controlResponse = this.handleControlPatterns(cleanInput);
    if (controlResponse) {
      return controlResponse;
    }

    // Handle code block generation patterns
    const codeBlockResponse = this.handleCodeBlockPatterns(cleanInput);
    if (codeBlockResponse) {
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
      result.push(codeBlock);
    }
    return result.join('\n\n');
  }
  
  // Legacy method - keeping for reference but now using ContentManager
  _generateCodeBlocksOld(count) {
    const languages = [
      { name: "Python", extension: "py" },
      { name: "SQL", extension: "sql" },
      { name: "Bash", extension: "sh" },
      { name: "JavaScript", extension: "js" },
      { name: "HTML", extension: "html" },
      { name: "CSS", extension: "css" },
      { name: "Java", extension: "java" },
      { name: "C++", extension: "cpp" },
      { name: "Go", extension: "go" },
      { name: "Rust", extension: "rs" }
    ];

    const codeSamples = {
      py: [
        "def fibonacci(n):\n    if n <= 1:\n        return n\n    else:\n        return fibonacci(n-1) + fibonacci(n-2)\n\n# Generate first 10 Fibonacci numbers\nfor i in range(10):\n    print(fibonacci(i))",
        "import requests\nimport json\n\ndef fetch_data(url):\n    response = requests.get(url)\n    if response.status_code == 200:\n        return response.json()\n    else:\n        return None\n\n# Example usage\ndata = fetch_data('https://api.example.com/data')\nif data:\n    print(json.dumps(data, indent=2))\nelse:\n    print('Failed to fetch data')",
        "class Animal:\n    def __init__(self, name, species):\n        self.name = name\n        self.species = species\n    \n    def make_sound(self):\n        pass\n\nclass Dog(Animal):\n    def make_sound(self):\n        return f'{self.name} says Woof!'\n\nclass Cat(Animal):\n    def make_sound(self):\n        return f'{self.name} says Meow!'\n\n# Create instances\nmy_dog = Dog('Buddy', 'Canine')\nmy_cat = Cat('Whiskers', 'Feline')\n\nprint(my_dog.make_sound())\nprint(my_cat.make_sound())"
      ],
      sql: [
        "SELECT customers.name, orders.order_date, products.product_name\nFROM customers\nJOIN orders ON customers.id = orders.customer_id\nJOIN order_items ON orders.id = order_items.order_id\nJOIN products ON order_items.product_id = products.id\nWHERE orders.order_date > '2023-01-01'\nORDER BY orders.order_date DESC;",
        "WITH RECURSIVE category_tree AS (\n  SELECT id, name, parent_id, 1 as level\n  FROM categories\n  WHERE parent_id IS NULL\n  \n  UNION ALL\n  \n  SELECT c.id, c.name, c.parent_id, ct.level + 1\n  FROM categories c\n  JOIN category_tree ct ON c.parent_id = ct.id\n)\nSELECT name, level\nFROM category_tree\nORDER BY level, name;",
        "CREATE INDEX idx_user_email ON users(email);\n\nALTER TABLE orders\nADD CONSTRAINT chk_order_total\nCHECK (total_amount >= 0);\n\nCREATE VIEW customer_order_summary AS\nSELECT \n  c.name,\n  COUNT(o.id) as total_orders,\n  SUM(o.total_amount) as total_spent\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name;"
      ],
      sh: [
        "#!/bin/bash\n\n# Function to check if a directory exists\ncheck_directory() {\n  if [ -d \"$1\" ]; then\n    echo \"Directory $1 exists\"\n  else\n    echo \"Directory $1 does not exist\"\n  fi\n}\n\n# Main script\nfor dir in \"$@\"; do\n  check_directory \"$dir\"\ndone",
        "#!/bin/bash\n\n# Backup script\nSOURCE_DIR=\"/home/user/documents\"\nBACKUP_DIR=\"/backup/documents\"\nDATE=$(date +%Y%m%d)\n\n# Create backup directory if it doesn't exist\nmkdir -p \"$BACKUP_DIR/$DATE\"\n\n# Copy files\nrsync -av \"$SOURCE_DIR/\" \"$BACKUP_DIR/$DATE/\"\n\n# Remove backups older than 30 days\nfind \"$BACKUP_DIR\" -type d -mtime +30 -exec rm -rf {} +",
        "#!/bin/bash\n\n# System monitoring script\nCPU_USAGE=$(top -bn1 | grep \"Cpu(s)\" | awk '{print $2}' | cut -d'%' -f1)\nMEMORY_USAGE=$(free | grep Mem | awk '{printf \"%.2f\", $3/$2 * 100.0}')\nDISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)\n\nif [ \"$CPU_USAGE\" -gt 80 ]; then\n  echo \"Warning: High CPU usage - $CPU_USAGE%\"\nfi\n\nif [ \"$MEMORY_USAGE\" -gt 80 ]; then\n  echo \"Warning: High memory usage - $MEMORY_USAGE%\"\nfi\n\nif [ \"$DISK_USAGE\" -gt 80 ]; then\n  echo \"Warning: High disk usage - $DISK_USAGE%\"\nfi"
      ],
      js: [
        "const fetchData = async (url) => {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error fetching data:', error);\n    return null;\n  }\n};\n\n// Usage\nfetchData('https://api.example.com/data')\n  .then(result => {\n    if (result) {\n      console.log('Data received:', result);\n    } else {\n      console.log('Failed to fetch data');\n    }\n  });",
        "class EventEmitter {\n  constructor() {\n    this.events = {};\n  }\n  \n  on(event, callback) {\n    if (!this.events[event]) {\n      this.events[event] = [];\n    }\n    this.events[event].push(callback);\n  }\n  \n  emit(event, data) {\n    if (this.events[event]) {\n      this.events[event].forEach(callback => callback(data));\n    }\n  }\n}\n\n// Usage\nconst emitter = new EventEmitter();\nemitter.on('dataReceived', (data) => console.log('Received:', data));\nemitter.emit('dataReceived', { message: 'Hello World' });",
        "const debounce = (func, delay) => {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => func(...args), delay);\n  };\n};\n\nconst throttle = (func, limit) => {\n  let inThrottle;\n  return (...args) => {\n    if (!inThrottle) {\n      func(...args);\n      inThrottle = true;\n      setTimeout(() => inThrottle = false, limit);\n    }\n  };\n};"
      ],
      html: [
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Responsive Grid</title>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"grid\">\n      <div class=\"card\">Card 1</div>\n      <div class=\"card\">Card 2</div>\n      <div class=\"card\">Card 3</div>\n      <div class=\"card\">Card 4</div>\n    </div>\n  </div>\n</body>\n</html>",
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"description\" content=\"A simple form example\">\n  <title>Form Validation</title>\n</head>\n<body>\n  <form id=\"userForm\" novalidate>\n    <div>\n      <label for=\"email\">Email:</label>\n      <input type=\"email\" id=\"email\" name=\"email\" required>\n      <span class=\"error\" id=\"emailError\"></span>\n    </div>\n    <div>\n      <label for=\"password\">Password:</label>\n      <input type=\"password\" id=\"password\" name=\"password\" required>\n      <span class=\"error\" id=\"passwordError\"></span>\n    </div>\n    <button type=\"submit\">Submit</button>\n  </form>\n  <script src=\"validate.js\"></script>\n</body>\n</html>",
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"theme-color\" content=\"#317EFB\">\n  <title>Progressive Web App</title>\n  <link rel=\"manifest\" href=\"manifest.json\">\n</head>\n<body>\n  <header>\n    <nav>\n      <ul>\n        <li><a href=\"#\">Home</a></li>\n        <li><a href=\"#\">About</a></li>\n        <li><a href=\"#\">Contact</a></li>\n      </ul>\n    </nav>\n  </header>\n  <main>\n    <section id=\"content\">\n      <!-- Dynamic content will be loaded here -->\n    </section>\n  </main>\n  <script src=\"app.js\"></script>\n</body>\n</html>"
      ],
      css: [
        ".grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  grid-gap: 20px;\n  padding: 20px;\n}\n\n.card {\n  background: #f5f5f5;\n  border-radius: 8px;\n  padding: 20px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n  transition: transform 0.3s ease;\n}\n\n.card:hover {\n  transform: translateY(-5px);\n  box-shadow: 0 4px 8px rgba(0,0,0,0.15);\n}",
        "@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n.fade-in-element {\n  animation: fadeIn 0.5s ease-out forwards;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .fade-in-element {\n    animation: none;\n    opacity: 1;\n  }\n}",
        ".dark-mode {\n  --bg-color: #1a1a1a;\n  --text-color: #ffffff;\n  --accent-color: #4da6ff;\n}\n\n.light-mode {\n  --bg-color: #ffffff;\n  --text-color: #333333;\n  --accent-color: #0066cc;\n}\n\nbody {\n  background-color: var(--bg-color);\n  color: var(--text-color);\n  transition: background-color 0.3s, color 0.3s;\n}"
      ],
      java: [
        "import java.util.*;\n\npublic class Graph {\n  private Map<Integer, List<Integer>> adjacencyList;\n  \n  public Graph() {\n    adjacencyList = new HashMap<>();\n  }\n  \n  public void addEdge(int source, int destination) {\n    adjacencyList.computeIfAbsent(source, k -> new ArrayList<>()).add(destination);\n    adjacencyList.computeIfAbsent(destination, k -> new ArrayList<>()).add(source);\n  }\n  \n  public List<Integer> getNeighbors(int vertex) {\n    return adjacencyList.getOrDefault(vertex, new ArrayList<>());\n  }\n}",
        "import java.util.concurrent.*;\n\npublic class ThreadPoolExample {\n  public static void main(String[] args) {\n    ExecutorService executor = Executors.newFixedThreadPool(4);\n    \n    for (int i = 0; i < 10; i++) {\n      final int taskId = i;\n      executor.submit(() -> {\n        System.out.println(\"Task \" + taskId + \" executed by \" + \n                          Thread.currentThread().getName());\n      });\n    }\n    \n    executor.shutdown();\n    try {\n      if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {\n        executor.shutdownNow();\n      }\n    } catch (InterruptedException e) {\n      executor.shutdownNow();\n    }\n  }\n}",
        "import java.util.*;\n\npublic class LRUCache<K, V> extends LinkedHashMap<K, V> {\n  private final int capacity;\n  \n  public LRUCache(int capacity) {\n    // AccessOrder = true for LRU behavior\n    super(capacity, 0.75f, true);\n    this.capacity = capacity;\n  }\n  \n  @Override\n  protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {\n    return size() > capacity;\n  }\n  \n  public static void main(String[] args) {\n    LRUCache<Integer, String> cache = new LRUCache<>(3);\n    cache.put(1, \"One\");\n    cache.put(2, \"Two\");\n    cache.put(3, \"Three\");\n    cache.get(1); // Accessing key 1\n    cache.put(4, \"Four\"); // This will remove key 2\n    \n    System.out.println(cache); // {1=One, 3=Three, 4=Four}\n  }\n}"
      ],
      cpp: [
        "#include <iostream>\n#include <vector>\n#include <algorithm>\n\ntemplate<typename T>\nclass CircularBuffer {\nprivate:\n  std::vector<T> buffer;\n  size_t head, tail, count, capacity;\n\npublic:\n  CircularBuffer(size_t size) : buffer(size), head(0), tail(0), count(0), capacity(size) {}\n  \n  void push(const T& item) {\n    buffer[tail] = item;\n    tail = (tail + 1) % capacity;\n    if (count == capacity) {\n      head = (head + 1) % capacity;\n    } else {\n      count++;\n    }\n  }\n  \n  T pop() {\n    if (count == 0) throw std::runtime_error(\"Buffer is empty\");\n    T item = buffer[head];\n    head = (head + 1) % capacity;\n    count--;\n    return item;\n  }\n};",
        "#include <iostream>\n#include <memory>\n\nclass Shape {\npublic:\n  virtual ~Shape() = default;\n  virtual double area() const = 0;\n  virtual void draw() const = 0;\n};\n\nclass Circle : public Shape {\nprivate:\n  double radius;\npublic:\n  Circle(double r) : radius(r) {}\n  double area() const override { return 3.14159 * radius * radius; }\n  void draw() const override { std::cout << \"Drawing a circle\\n\"; }\n};\n\nclass Rectangle : public Shape {\nprivate:\n  double width, height;\npublic:\n  Rectangle(double w, double h) : width(w), height(h) {}\n  double area() const override { return width * height; }\n  void draw() const override { std::cout << \"Drawing a rectangle\\n\"; }\n};\n\nint main() {\n  std::vector<std::unique_ptr<Shape>> shapes;\n  shapes.push_back(std::make_unique<Circle>(5.0));\n  shapes.push_back(std::make_unique<Rectangle>(4.0, 6.0));\n  \n  for (const auto& shape : shapes) {\n    shape->draw();\n    std::cout << \"Area: \" << shape->area() << \"\\n\\n\";\n  }\n  \n  return 0;\n}",
        "#include <iostream>\n#include <thread>\n#include <mutex>\n#include <condition_variable>\n#include <queue>\n\nclass ThreadSafeQueue {\nprivate:\n  std::queue<int> q;\n  std::mutex mtx;\n  std::condition_variable cv;\n\npublic:\n  void push(int value) {\n    std::lock_guard<std::mutex> lock(mtx);\n    q.push(value);\n    cv.notify_one();\n  }\n  \n  int pop() {\n    std::unique_lock<std::mutex> lock(mtx);\n    cv.wait(lock, [this] { return !q.empty(); });\n    int value = q.front();\n    q.pop();\n    return value;\n  }\n};"
      ],
      go: [
        "package main\n\nimport (\n  \"fmt\"\n  \"sync\"\n  \"time\"\n)\n\nfunc producer(wg *sync.WaitGroup, ch chan<- int) {\n  defer wg.Done()\n  for i := 0; i < 5; i++ {\n    ch <- i\n    time.Sleep(time.Millisecond * 100)\n  }\n  close(ch)\n}\n\nfunc consumer(wg *sync.WaitGroup, ch <-chan int) {\n  defer wg.Done()\n  for value := range ch {\n    fmt.Printf(\"Consumed: %d\\n\", value)\n  }\n}\n\nfunc main() {\n  var wg sync.WaitGroup\n  ch := make(chan int, 2)\n  \n  wg.Add(2)\n  go producer(&wg, ch)\n  go consumer(&wg, ch)\n  \n  wg.Wait()\n}",
        "package main\n\nimport (\n  \"context\"\n  \"fmt\"\n  \"net/http\"\n  \"time\"\n)\n\nfunc handler(w http.ResponseWriter, r *http.Request) {\n  ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)\n  defer cancel()\n  \n  select {\n  case <-time.After(2 * time.Second):\n    fmt.Fprintf(w, \"Hello, World!\")\n  case <-ctx.Done():\n    http.Error(w, \"Request timeout\", http.StatusRequestTimeout)\n  }\n}\n\nfunc main() {\n  http.HandleFunc(\"/\", handler)\n  fmt.Println(\"Server starting on :8080\")\n  http.ListenAndServe(\":8080\", nil)\n}",
        "package main\n\nimport (\n  \"fmt\"\n  \"sort\"\n)\n\ntype Person struct {\n  Name string\n  Age  int\n}\n\ntype ByAge []Person\n\nfunc (a ByAge) Len() int           { return len(a) }\nfunc (a ByAge) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }\nfunc (a ByAge) Less(i, j int) bool { return a[i].Age < a[j].Age }\n\nfunc main() {\n  people := []Person{\n    {\"Alice\", 30},\n    {\"Bob\", 25},\n    {\"Charlie\", 35},\n  }\n  \n  sort.Sort(ByAge(people))\n  fmt.Println(people)\n}"
      ],
      rs: [
        "use std::collections::HashMap;\n\n#[derive(Debug)]\nstruct Cache<K, V> {\n    data: HashMap<K, V>,\n    capacity: usize,\n}\n\nimpl<K, V> Cache<K, V>\nwhere\n    K: std::hash::Hash + Eq + Clone,\n{\n    fn new(capacity: usize) -> Self {\n        Cache {\n            data: HashMap::new(),\n            capacity,\n        }\n    }\n    \n    fn insert(&mut self, key: K, value: V) -> Option<V> {\n        if self.data.len() >= self.capacity && !self.data.contains_key(&key) {\n            // Simple eviction: remove first item\n            if let Some(first_key) = self.data.keys().next().cloned() {\n                self.data.remove(&first_key);\n            }\n        }\n        self.data.insert(key, value)\n    }\n    \n    fn get(&self, key: &K) -> Option<&V> {\n        self.data.get(key)\n    }\n}",
        "use tokio::time::{sleep, Duration};\nuse std::sync::Arc;\nuse tokio::sync::Mutex;\n\n#[derive(Clone)]\nstruct Counter {\n    value: Arc<Mutex<i32>>,\n}\n\nimpl Counter {\n    fn new() -> Self {\n        Counter {\n            value: Arc::new(Mutex::new(0)),\n        }\n    }\n    \n    async fn increment(&self) {\n        let mut val = self.value.lock().await;\n        *val += 1;\n        println!(\"Counter: {}\", *val);\n    }\n}\n\n#[tokio::main]\nasync fn main() {\n    let counter = Counter::new();\n    \n    let mut handles = vec![];\n    \n    for _ in 0..5 {\n        let counter_clone = counter.clone();\n        let handle = tokio::spawn(async move {\n            counter_clone.increment().await;\n            sleep(Duration::from_millis(100)).await;\n        });\n        handles.push(handle);\n    }\n    \n    for handle in handles {\n        handle.await.unwrap();\n    }\n}",
        "use serde::{Deserialize, Serialize};\nuse std::fs;\n\n#[derive(Serialize, Deserialize, Debug)]\nstruct Config {\n    name: String,\n    version: String,\n    features: Vec<String>,\n}\n\nfn load_config(path: &str) -> Result<Config, Box<dyn std::error::Error>> {\n    let contents = fs::read_to_string(path)?;\n    let config: Config = serde_json::from_str(&contents)?;\n    Ok(config)\n}\n\nfn save_config(config: &Config, path: &str) -> Result<(), Box<dyn std::error::Error>> {\n    let json = serde_json::to_string_pretty(config)?;\n    fs::write(path, json)?;\n    Ok(())\n}\n\nfn main() -> Result<(), Box<dyn std::error::Error>> {\n    let config = Config {\n        name: \"MyApp\".to_string(),\n        version: \"1.0.0\".to_string(),\n        features: vec![\"feature1\".to_string(), \"feature2\".to_string()],\n    };\n    \n    save_config(&config, \"config.json\")?;\n    let loaded_config = load_config(\"config.json\")?;\n    println!(\"{:#?}\", loaded_config);\n    \n    Ok(())\n}"
      ]
    };

    const result = [];
    for (let i = 0; i < count; i++) {
      const randomLang = languages[Math.floor(Math.random() * languages.length)];
      const samples = codeSamples[randomLang.extension];
      const randomCode = samples[Math.floor(Math.random() * samples.length)];
      
      result.push(`Here's a ${randomLang.name} code example:\n\n\`\`\`${randomLang.extension}\n${randomCode}\n\`\`\``);
    }

    return result.join('\n\n');
  }  
  generateMarkdownTables(count) {
    return this.contentManager.getMarkdownTable(count);
  }
  
  // Legacy method - keeping for reference but now using ContentManager
  _generateMarkdownTablesOld(count) {
    const tableSamples = [
      // Simple narrow table with basic formatting
      "| **Name** | *Age* | Status |\n|----------|-------|--------|\n| **John** | *25*  | Active |\n| **Jane** | *22*  | [Online](https://example.com/jane) |\n| **Bob**  | *30*  | ***Premium*** |",

      // Wide table with complex content and mixed formatting
      "| Feature | Description | Status | **Version** | *Notes* |\n|---------|-------------|--------|-------------|----------|\n| **Real-time chat** | *Instant messaging* with **low latency** | ✅ [Active](https://docs.example.com/chat) | `2.1.0` | ***Production ready*** |\n| **File sharing** | Share documents, images up to *100MB* | ✅ **Active** | `1.5.2` | [See limits](https://help.example.com/limits) |\n| ***Video calls*** | High-quality conferencing with up to **50 participants** | ⚠️ *Beta* | `3.0.0` | [Beta program](https://beta.example.com) |\n| **Screen sharing** | Share your screen in ***real-time*** | ❌ *Disabled* | `1.0.0` | Coming soon |",

      // Table with code snippets and links
      "| **Language** | *Hello World Example* | **Docs** | ***Difficulty*** |\n|--------------|----------------------|----------|------------------|\n| **Python** | `print(\"Hello, World!\")` | [Python.org](https://python.org) | *Beginner* |\n| ***JavaScript*** | `console.log(\"Hello!\");` | [MDN](https://developer.mozilla.org) | **Easy** |\n| **Java** | `System.out.println(\"Hello!\");` | [Oracle Docs](https://docs.oracle.com/java) | ***Intermediate*** |\n| *C++* | `std::cout << \"Hello!\" << std::endl;` | [CPP Reference](https://cppreference.com) | **Advanced** |",

      // Financial data with formatting and calculations
      "| **Month** | *Revenue* | **Expenses** | ***Profit*** | Growth |\n|-----------|-----------|--------------|--------------|--------|\n| **January** | *$10,000* | $7,000 | ***$3,000*** | [+15%](https://reports.example.com/jan) |\n| ***February*** | *$12,000* | $8,000 | **$4,000** | [+33%](https://reports.example.com/feb) |\n| **March** | ***$15,000*** | $9,000 | *$6,000* | [+50%](https://reports.example.com/mar) |\n| *Q1 Total* | **$37,000** | *$24,000* | ***$13,000*** | [Excellent](https://dashboard.example.com) |",

      // Project status with rich formatting
      "| **Project** | ***Status*** | *Owner* | **Deadline** | Links |\n|-------------|--------------|---------|--------------|-------|\n| **Website Redesign** | 🟢 *On Track* | **Alice** | *March 15* | [Figma](https://figma.com/project1) \\| [GitHub](https://github.com/project1) |\n| ***Mobile App*** | 🟡 **At Risk** | *Bob* | **April 1** | [Prototype](https://app.example.com) \\| [Docs](https://docs.example.com/mobile) |\n| **API v2** | 🔴 ***Delayed*** | **Charlie** | *May 30* | [Swagger](https://api.example.com/docs) |\n| *Database Migration* | ✅ **Complete** | ***Team*** | ~~*Feb 28*~~ | [Report](https://reports.example.com/db-migration) |",

      // Technical comparison with detailed formatting
      "| **Framework** | ***Performance*** | *Learning Curve* | **Community** | Resources |\n|---------------|-------------------|------------------|---------------|----------|\n| **React** | ⭐⭐⭐⭐ *Fast* | **Moderate** | ***Excellent*** | [Docs](https://reactjs.org) \\| [Tutorial](https://react.dev/tutorial) |\n| ***Vue.js*** | ⭐⭐⭐⭐⭐ **Very Fast** | *Easy* | **Good** | [Guide](https://vuejs.org) \\| [Examples](https://vuejs.org/examples) |\n| **Angular** | ⭐⭐⭐ *Good* | ***Steep*** | **Excellent** | [Docs](https://angular.io) \\| [CLI](https://cli.angular.io) |\n| *Svelte* | ⭐⭐⭐⭐⭐ ***Blazing*** | **Easy** | *Growing* | [Tutorial](https://svelte.dev/tutorial) |",

      // User roles and permissions with complex formatting
      "| **Role** | ***Permissions*** | *Access Level* | **Users** | Actions |\n|----------|-------------------|----------------|-----------|----------|\n| ***Admin*** | **Full Access** | *Level 5* | 3 | [Manage](https://admin.example.com/users) \\| [Audit](https://admin.example.com/logs) |\n| **Editor** | *Content + Users* | **Level 3** | 12 | [Edit](https://cms.example.com) \\| [Publish](https://cms.example.com/publish) |\n| *Viewer* | **Read Only** | ***Level 1*** | 45 | [Dashboard](https://app.example.com/dashboard) |\n| **Guest** | *Limited Preview* | Level 0 | ∞ | [Sign Up](https://example.com/register) |",

      // API endpoints with method formatting
      "| **Method** | ***Endpoint*** | *Description* | **Auth** | Example |\n|------------|----------------|---------------|----------|----------|\n| **GET** | `/api/users` | *List all users* | 🔐 **Required** | [Try it](https://api.example.com/docs#get-users) |\n| ***POST*** | `/api/users` | **Create new user** | 🔐 *Required* | [Example](https://api.example.com/docs#post-users) |\n| **PUT** | `/api/users/{id}` | ***Update user*** | 🔐 **Required** | `curl -X PUT /api/users/123` |\n| *DELETE* | `/api/users/{id}` | **Delete user** | 🔐 ***Admin Only*** | [Docs](https://api.example.com/docs#delete-users) |",

      // Minimalist but enhanced table
      "| ***A*** | **B** | *C* |\n|---------|-------|-----|\n| **1** | *2* | [3](https://example.com) |\n| ***X*** | **Y** | *Z* |",

      // Server status with real-time formatting
      "| **Server** | ***Status*** | *Uptime* | **Load** | Actions |\n|------------|--------------|----------|----------|----------|\n| **Web-01** | 🟢 ***Online*** | *99.9%* | **0.45** | [Monitor](https://monitor.example.com/web01) \\| [Logs](https://logs.example.com/web01) |\n| ***DB-01*** | 🟡 **Warning** | *98.2%* | ***0.89*** | [Check](https://db.example.com/status) \\| [Optimize](https://db.example.com/optimize) |\n| **Cache-01** | 🟢 *Healthy* | **100%** | ***0.12*** | [Stats](https://cache.example.com/stats) |\n| *Load Balancer* | 🟢 **Active** | ***99.99%*** | *0.23* | [Config](https://lb.example.com/config) |",

      // Complex links with formatting in same cell
      "| **Feature** | ***Description & Links*** | *Status* | **Actions** |\n|-------------|---------------------------|----------|-------------|\n| **Authentication** | ***OAuth 2.0*** with [**Google**](https://developers.google.com/identity) and [*GitHub*](https://docs.github.com/oauth) support | ✅ *Live* | [**Configure**](https://admin.example.com/auth) \\| [*Test*](https://test.example.com/oauth) |\n| ***File Upload*** | Support for **images** ([*PNG*](https://example.com/png), [**JPEG**](https://example.com/jpeg)) and ***documents*** ([*PDF*](https://example.com/pdf), [**DOCX**](https://example.com/docx)) | 🟡 **Beta** | [***Upload Test***](https://test.example.com/upload) |\n| **Real-time Sync** | *WebSocket* connection with [**Socket.io**](https://socket.io) and ***fallback*** to [*long polling*](https://example.com/polling) | ✅ ***Active*** | [**Monitor**](https://monitor.example.com/ws) \\| [*Debug*](https://debug.example.com/ws) |",

      // Documentation with mixed formatting and links
      "| **Component** | ***Documentation & Examples*** | *Version* | **Support** |\n|---------------|--------------------------------|-----------|-------------|\n| **Button** | [***Primary***](https://storybook.example.com/button-primary), [**Secondary**](https://storybook.example.com/button-secondary), and [*Disabled*](https://storybook.example.com/button-disabled) variants | `v2.1.0` | [**GitHub Issues**](https://github.com/example/ui/issues) \\| [*Slack*](https://slack.example.com/ui) |\n| ***Modal*** | **Responsive** design with [*animations*](https://example.com/modal-animations) and [**accessibility**](https://example.com/modal-a11y) features | `v1.8.3` | [***Documentation***](https://docs.example.com/modal) \\| [**Examples**](https://codepen.io/example/modal) |\n| **Form** | ***Validation*** with [**Yup**](https://github.com/jquense/yup) and [*React Hook Form*](https://react-hook-form.com) integration | `v3.0.0` | [**Tutorial**](https://tutorial.example.com/forms) \\| [*API Reference*](https://api.example.com/forms) |",

      // Performance metrics with rich formatting
      "| **Metric** | ***Current Value*** | *Target* | **Trend** | ***Analysis*** |\n|------------|---------------------|----------|-----------|----------------|\n| **Page Load** | ***2.3s*** ([*Desktop*](https://pagespeed.web.dev/desktop)) **1.8s** ([*Mobile*](https://pagespeed.web.dev/mobile)) | *< 2.0s* | 📈 **Improving** | [**Lighthouse Report**](https://lighthouse.example.com) \\| [*Optimization Guide*](https://perf.example.com/guide) |\n| ***Bundle Size*** | **1.2MB** *gzipped* ([*Webpack Analysis*](https://bundle-analyzer.example.com)) | *< 1.0MB* | 📉 ***Decreasing*** | [**Bundle Analyzer**](https://analyzer.example.com) \\| [*Tree Shaking Guide*](https://webpack.example.com/tree-shaking) |\n| **API Response** | ***150ms*** *average* ([*P95: 300ms*](https://metrics.example.com/p95)) | *< 200ms* | 📊 **Stable** | [***Monitoring Dashboard***](https://datadog.example.com) \\| [**Alerts**](https://alerts.example.com/api) |",

      // Security features with detailed links and formatting
      "| **Security Layer** | ***Implementation Details*** | *Status* | **Compliance** | ***Resources*** |\n|--------------------|------------------------------|----------|----------------|------------------|\n| **Encryption** | ***AES-256*** at rest, **TLS 1.3** in transit ([*Certificate*](https://ssl.example.com/cert)) | ✅ ***Active*** | **SOC 2** \\| *ISO 27001* | [**Security Policy**](https://security.example.com/policy) \\| [*Audit Report*](https://audit.example.com/2024) |\n| ***Authentication*** | **Multi-factor** with [*TOTP*](https://tools.ietf.org/rfc/rfc6238.txt) and [**WebAuthn**](https://webauthn.io) support | ✅ **Enabled** | ***NIST 800-63*** | [**Setup Guide**](https://help.example.com/mfa) \\| [*Recovery Process*](https://help.example.com/recovery) |\n| **Access Control** | ***RBAC*** with [**fine-grained permissions**](https://auth.example.com/rbac) and [*audit logging*](https://logs.example.com/access) | ✅ ***Configured*** | **GDPR** \\| *CCPA* | [***Admin Panel***](https://admin.example.com/access) \\| [**Compliance Dashboard**](https://compliance.example.com) |",

      // Integration status with complex formatting
      "| **Integration** | ***Configuration & Status*** | *Health* | **Last Sync** | ***Actions*** |\n|-----------------|------------------------------|----------|---------------|---------------|\n| **Slack** | ***Webhook*** configured for [*#alerts*](https://slack.example.com/alerts) and [**#deployments**](https://slack.example.com/deployments) | 🟢 **Healthy** | *2 min ago* | [**Test Webhook**](https://test.example.com/slack) \\| [*Reconfigure*](https://config.example.com/slack) |\n| ***GitHub*** | **OAuth App** with [*repository access*](https://github.com/settings/applications) and [**webhook events**](https://docs.github.com/webhooks) | ✅ ***Connected*** | *5 min ago* | [**Sync Now**](https://sync.example.com/github) \\| [*View Logs*](https://logs.example.com/github) |\n| **Jira** | ***API Token*** for [**issue tracking**](https://jira.example.com/projects) and [*sprint planning*](https://jira.example.com/sprints) | 🟡 **Warning** | *1 hour ago* | [***Refresh Token***](https://auth.example.com/jira) \\| [**Troubleshoot**](https://help.example.com/jira) |"
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
      const randomTable = tableSamples[Math.floor(Math.random() * tableSamples.length)];
      result.push(`Here's a markdown table for testing:\n\n${randomTable}`);
    }

    return result.join('\n\n');
  }

  generateLinkedContent(complexity) {
    return this.contentManager.getLinkedContent(complexity);
  }
  
  // Legacy method - keeping for reference but now using ContentManager
  _generateLinkedContentOld(complexity) {
    const urls = [
      "https://www.example.com",
      "https://docs.hypertext.org",
      "https://xanadu.net",
      "https://www.w3.org",
      "https://info.cern.ch",
      "https://www.ietf.org/rfc/rfc1945.txt",
      "https://web.archive.org",
      "https://github.com/worldwideweb",
      "https://developer.mozilla.org",
      "https://www.whatwg.org",
      "https://semantic-web.org",
      "https://linked-data.org",
      "https://microformats.org",
      "https://indieweb.org",
      "https://webfoundation.org",
      "https://www.ted.com/talks/tim_berners_lee",
      "https://hyperland.com",
      "https://memex.org",
      "https://nelson.systems",
      "https://transcopyright.org"
    ];

    const linkTexts = [
      "the original web proposal",
      "hypertext dreams",
      "Xanadu's vision",
      "universal information space",
      "the first website",
      "HTTP specification",
      "digital preservation",
      "collaborative development",
      "web standards",
      "living documents",
      "semantic connections",
      "linked data principles",
      "structured markup",
      "decentralized web",
      "information freedom",
      "the web's inventor",
      "interactive media",
      "associative trails",
      "literary machines",
      "transcopyright theory"
    ];

    if (complexity === 1) {
      // Simple format with plain URLs and basic markdown links
      const plainUrl = urls[Math.floor(Math.random() * urls.length)];
      const linkUrl = urls[Math.floor(Math.random() * urls.length)];
      const linkText = linkTexts[Math.floor(Math.random() * linkTexts.length)];
      
      return `In the grand tradition of Douglas Adams' infinite improbability, the web emerged from the most unlikely of places - a particle physics laboratory where Tim Berners-Lee was trying to solve the mundane problem of information sharing. Much like the Babel fish, which solved all communication problems and thereby caused more wars than anything else in history, the World Wide Web solved the problem of accessing information and promptly created the problem of information overload.

Consider this fascinating resource: ${plainUrl}

Ted Nelson's Xanadu project, meanwhile, had been dreaming of [${linkText}](${linkUrl}) since the 1960s - a system of interconnected documents that would make all human knowledge accessible through associative links. It was the literary equivalent of the Heart of Gold's infinite improbability drive, capable of connecting any two ideas no matter how seemingly unrelated.

The web we got wasn't quite Xanadu's vision of transcopyright and parallel documents, but it did give us something equally improbable: a system where a search for "how to fix a leaky faucet" could lead you through seventeen Wikipedia articles to learn about the mating habits of deep-sea anglerfish. As Adams might say, the web is big. Really big. You just won't believe how vastly, hugely, mind-bogglingly big it is.`;
    }

    if (complexity === 2) {
      // Multiple paragraphs with various link formats
      const urls1 = urls.slice(0, 3).map((url, i) => ({ url, text: linkTexts[i] }));
      const plainUrls = urls.slice(3, 5);
      
      return `The story of hypertext begins not with Tim Berners-Lee's World Wide Web, but with Vannevar Bush's 1945 essay "As We May Think," where he envisioned the Memex - a device that would store books, records, and communications, and mechanically link them together by association. This was ${plainUrls[0]} territory: the realm of infinite possibility where information could be connected in ways that mirrored human thought itself.

Ted Nelson, inspired by Bush's vision, coined the term "hypertext" in 1963 and spent decades developing [${urls1[0].text}](${urls1[0].url}) - a system that would revolutionize how we think about documents, copyright, and knowledge itself. Nelson's Xanadu wasn't just about linking documents; it was about creating a [${urls1[1].text}](${urls1[1].url}) where every quotation would be automatically linked to its source, where authors would be compensated for every use of their work, and where the sum of human knowledge would be accessible through an elegant web of associations.

Meanwhile, at CERN in 1989, Tim Berners-Lee was facing a more prosaic problem: scientists couldn't easily share information across different computer systems. His solution was elegantly simple compared to Xanadu's grand vision - a system of [${urls1[2].text}](${urls1[2].url}) that used simple markup and universal identifiers. The web that emerged was less ambitious than Xanadu but infinitely more practical, like the difference between the Hitchhiker's Guide to the Galaxy (which knows everything but is often wrong) and a really good encyclopedia (which knows less but is usually right).

The irony, as Douglas Adams would appreciate, is that both visions came true in unexpected ways. We got Nelson's associative linking through hyperlinks, Bush's vast information storage through search engines, and Berners-Lee's universal access through ${plainUrls[1]}. What we also got, quite by accident, was the ability for anyone to publish anything, leading to a universe where the answer to life, the universe, and everything might actually be findable - if you can figure out the right search terms.`;
    }

    if (complexity === 3) {
      // Complex content with markdown table containing links
      const tableUrls = urls.slice(0, 6).map((url, i) => ({ url, text: linkTexts[i] }));
      const paragraphUrls = urls.slice(6, 10).map((url, i) => ({ url, text: linkTexts[i + 6] }));
      const plainUrls = urls.slice(10, 13);
      
      return `In 1945, Vannevar Bush published "As We May Think" in The Atlantic Monthly, describing a device called the Memex that would store vast amounts of information and allow users to create associative trails between documents. This wasn't just science fiction - it was a blueprint for what would eventually become the World Wide Web, though it would take nearly half a century and the combined genius of visionaries like Ted Nelson and Tim Berners-Lee to make it reality.

| **Visionary** | **Project/Contribution** | **Key Innovation** | **Timeline** | **Legacy** |
|---------------|-------------------------|-------------------|--------------|------------|
| Vannevar Bush | Memex Concept | [${tableUrls[0].text}](${tableUrls[0].url}) | 1945 | Inspired hypertext pioneers |
| Ted Nelson | Xanadu Project | [${tableUrls[1].text}](${tableUrls[1].url}) | 1960s-present | Coined "hypertext" and "hypermedia" |
| Douglas Engelbart | oN-Line System (NLS) | [${tableUrls[2].text}](${tableUrls[2].url}) | 1968 | Demonstrated collaborative computing |
| Tim Berners-Lee | World Wide Web | [${tableUrls[3].text}](${tableUrls[3].url}) | 1989-1991 | Created the web we know today |
| Marc Andreessen | Mosaic Browser | [${tableUrls[4].text}](${tableUrls[4].url}) | 1993 | Made the web accessible to everyone |
| Brewster Kahle | Internet Archive | [${tableUrls[5].text}](${tableUrls[5].url}) | 1996 | Preserving digital history |

Ted Nelson's Xanadu project, begun in the 1960s, was perhaps the most ambitious of these visions. Nelson didn't just want to link documents - he wanted to create a [${paragraphUrls[0].text}](${paragraphUrls[0].url}) where every piece of text would maintain its connection to its source, where authors would be automatically compensated for quotations, and where the entire corpus of human knowledge would be navigable through what he called "transclusion" - the ability to include parts of documents within other documents while maintaining their original context.

The web that Tim Berners-Lee actually created at CERN was more modest but infinitely more practical. Instead of Nelson's complex bidirectional links and micropayment systems, Berners-Lee opted for simple one-way links and free access. His [${paragraphUrls[1].text}](${paragraphUrls[1].url}) included three fundamental technologies: HTML for structuring documents, HTTP for transferring them, and URLs for addressing them. The first website, ${plainUrls[0]}, went live in 1991 and explained what the World Wide Web was.

As Douglas Adams might have observed, the web's success came not from solving the problem of information organization (which it spectacularly failed to do), but from making information sharing so easy that organization became someone else's problem. Search engines like Google became the Babel fish of the internet - universal translators that could find meaning in the chaos. The [${paragraphUrls[2].text}](${paragraphUrls[2].url}) that emerged wasn't the elegant, structured knowledge space that Nelson envisioned, but rather something more like the Hitchhiker's Guide itself: vast, mostly harmless, occasionally accurate, and utterly indispensable.

Today, as we grapple with issues of misinformation, platform monopolies, and digital rights, Nelson's original vision of [${paragraphUrls[3].text}](${paragraphUrls[3].url}) seems more relevant than ever. The IndieWeb movement, blockchain-based publishing, and efforts to create more equitable creator compensation systems all echo Xanadu's core principles. Perhaps, as Adams suggested about the universe, the web isn't finished yet - it's still in beta, and the real version is still being debugged.

The ultimate irony is that both Bush's Memex and Nelson's Xanadu were designed to augment human intelligence and creativity, while the web we actually got often seems designed to distract us from both. But then again, as any reader of The Hitchhiker's Guide to the Galaxy knows, the most important thing about any technology isn't what it was designed to do, but what people actually do with it. And what people have done with the web - from ${plainUrls[1]} to ${plainUrls[2]} - has been nothing short of extraordinary, even if it wasn't quite what anyone originally had in mind.`;
    }

    return "The web is a curious thing, much like a digital Babel fish - it connects everything to everything else, but doesn't necessarily make any of it more comprehensible.";
  }
}

// Global variables for streaming control
global.streamingSpeedMultiplier = 1;
global.requestLatency = 50;

export { ElizaBot };