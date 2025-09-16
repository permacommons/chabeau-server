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

  handleControlPatterns(input) {
    // Speed control patterns
    if (input === '>>>') {
      streamingSpeedMultiplier = 100;
      return "Whoa there, speed demon! I've cranked my response rate up to 100x baseline (that's 5,000 tokens per second). At this rate, I could recite the entire works of Shakespeare in about 3 seconds. Fun fact: hummingbirds flap their wings at about 80 beats per second, which is still slower than my current token rate!";
    }
    if (input === '>>') {
      streamingSpeedMultiplier = 10;
      return "Alright, shifting into high gear! I'm now streaming at 10x baseline speed (500 tokens per second). That's roughly equivalent to the typing speed of a very caffeinated court stenographer or a woodpecker hammering away at a particularly stubborn tree. Did you know that the fastest human typists can reach about 200 words per minute? I'm currently doing about 6,000 words per minute!";
    }
    if (input === '>') {
      streamingSpeedMultiplier = 5;
      return "Picking up the pace! I'm now streaming at 5x baseline speed (250 tokens per second). This is about as fast as an auctioneer on a good day, or roughly the speed at which a hummingbird's heart beats. Interestingly, this is also approximately the rate at which neurons fire in your brain when you're really concentrating!";
    }
    if (input === '<<<') {
      streamingSpeedMultiplier = 1;
      return "Ahh, back to baseline! I'm now streaming at my normal, leisurely pace of 50 tokens per second. This is roughly the speed of a comfortable conversation, about as fast as you might read aloud to a child, or the rate at which a sloth moves when it's really motivated. Sometimes slow and steady really does win the race!";
    }
    if (input === '<<') {
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
    if (input === '<') {
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

    // Latency control patterns
    if (input === ')))') {
      requestLatency = 5000; // 5 seconds
      return "Wow, I'm feeling really sluggish today! I've set my initial request latency to a whopping 5 seconds. This is like waiting for a computer from the 1980s to boot up, or watching paint dry in slow motion. Fun fact: a sloth moves at about 0.24 kilometers per hour, but at this latency, I'm moving slower than even their internet connection would be!";
    }
    if (input === '))') {
      requestLatency = 2500; // 2.5 seconds
      return "Feeling a bit sluggish now! I've increased my initial request latency to 2.5 seconds. That's about as long as it takes to brew a cup of tea or read a short poem. Did you know that the average human attention span is about 8 seconds? At this rate, I'm testing the limits of your patience!";
    }
    if (input === ')') {
      requestLatency = 500; // 0.5 seconds
      return "Adding a little delay to my responses! I've set my initial request latency to 500 milliseconds. This is about the time it takes for a human to blink their eyes or for a computer to process a simple command. Interestingly, a housefly's nervous system can process visual information in about 30 milliseconds, so I'm still much slower than a fly's reaction time!";
    }
    if (input === '(((') {
      requestLatency = 50; // back to baseline
      return "Back to my normal speed! I've reset my initial request latency to the baseline 50 milliseconds. This is about as fast as a human can perceive a delay - any faster and it would feel instantaneous. For comparison, a camera flash typically lasts about 1 millisecond, so I'm still 50 times slower than that!";
    }
    if (input === '((') {
      if (requestLatency === 5000) {
        requestLatency = 500;
        return "Speeding up a bit! I've reduced my initial request latency from 5 seconds to 500 milliseconds. That's like going from a leisurely stroll to a brisk walk. Still perceptibly delayed, but much more responsive than before!";
      } else if (requestLatency === 2500) {
        requestLatency = 50;
        return "Much better! I've reduced my initial request latency from 2.5 seconds to the baseline 50 milliseconds. Now I'm back to feeling snappy and responsive, like a modern computer should be!";
      } else {
        requestLatency = 50;
        return "I'm already at or near baseline latency (50ms)! Can't get much faster than this - it's like trying to make light travel faster!";
      }
    }
    if (input === '(') {
      if (requestLatency === 5000) {
        requestLatency = 2500;
        return "Feeling a bit more responsive! I've reduced my initial request latency from 5 seconds to 2.5 seconds. That's still quite slow, but at least it's not glacial anymore. Think of it as going from a glacier's movement to a slow river current!";
      } else if (requestLatency === 2500) {
        requestLatency = 500;
        return "Getting faster! I've reduced my initial request latency from 2.5 seconds to 500 milliseconds. This is about as long as it takes to clap your hands once - much more reasonable for a chatbot!";
      } else if (requestLatency === 500) {
        requestLatency = 50;
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

  generateCodeBlocks(count) {
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
        "package main\n\nimport (\n  \"fmt\"\n  \"net/http\"\n  \"log\"\n)\n\nfunc handler(w http.ResponseWriter, r *http.Request) {\n  fmt.Fprintf(w, \"Hello, World! Request path: %s\", r.URL.Path)\n}\n\nfunc main() {\n  http.HandleFunc(\"/\", handler)\n  log.Println(\"Server starting on port 8080...\")\n  log.Fatal(http.ListenAndServe(\":8080\", nil))\n}",
        "package main\n\nimport (\n  \"fmt\"\n  \"context\"\n  \"time\"\n)\n\nfunc main() {\n  // Create a context with timeout\n  ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)\n  defer cancel()\n  \n  // Simulate work with context\n  result := doWork(ctx)\n  fmt.Println(result)\n}\n\nfunc doWork(ctx context.Context) string {\n  select {\n  case <-time.After(3 * time.Second):\n    return \"Work completed\"\n  case <-ctx.Done():\n    return \"Work cancelled: \" + ctx.Err().Error()\n  }\n}"
      ],
      rs: [
        "use std::collections::HashMap;\nuse std::thread;\nuse std::sync::{Arc, Mutex};\n\nfn main() {\n  let data = Arc::new(Mutex::new(HashMap::new()));\n  let mut handles = vec![];\n  \n  for i in 0..5 {\n    let data_clone = Arc::clone(&data);\n    let handle = thread::spawn(move || {\n      let mut map = data_clone.lock().unwrap();\n      map.insert(i, i * 2);\n    });\n    handles.push(handle);\n  }\n  \n  for handle in handles {\n    handle.join().unwrap();\n  }\n  \n  println!(\"Data: {:?}\", data.lock().unwrap());\n}",
        "fn fibonacci(n: u32) -> u64 {\n  match n {\n    0 => 0,\n    1 => 1,\n    _ => fibonacci(n - 1) + fibonacci(n - 2)\n  }\n}\n\nfn main() {\n  for i in 0..10 {\n    println!(\"fibonacci({}) = {}\", i, fibonacci(i));\n  }\n}",
        "#[derive(Debug)]\nenum Message {\n  Quit,\n  Move { x: i32, y: i32 },\n  Write(String),\n  ChangeColor(i32, i32, i32),\n}\n\nimpl Message {\n  fn call(&self) {\n    match self {\n      Message::Quit => println!(\"Quitting\"),\n      Message::Move { x, y } => println!(\"Moving to ({}, {})\", x, y),\n      Message::Write(text) => println!(\"Writing: {}\", text),\n      Message::ChangeColor(r, g, b) => println!(\"Changing color to RGB({}, {}, {})\", r, g, b),\n    }\n  }\n}\n\nfn main() {\n  let messages = [\n    Message::Quit,\n    Message::Move { x: 10, y: 20 },\n    Message::Write(String::from(\"Hello, world!\")),\n    Message::ChangeColor(255, 0, 0),\n  ];\n  \n  for message in &messages {\n    message.call();\n  }\n}"
      ]
    };

    const result = [];
    for (let i = 0; i < count; i++) {
      const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
      const languageCode = randomLanguage.extension;
      const languageName = randomLanguage.name;

      const samples = codeSamples[languageCode];
      if (samples && samples.length > 0) {
        const randomSample = samples[Math.floor(Math.random() * samples.length)];
        result.push(`${languageName}:\n\n\`\`\`${languageCode}\n${randomSample}\n\`\`\``);
      } else {
        result.push(`${languageName}:\n\n\`\`\`${languageCode}\n// Sample code for ${languageName}\n\`\`\``);
      }
    }

    return result.join('\n\n');
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

  generateMarkdownTables(count) {
    const tableSamples = [
      // Simple narrow table
      "| Name | Age |\n|------|-----|\n| John | 25  |\n| Jane | 22  |\n| Bob  | 30  |",

      // Wide table with complex content
      "| Feature          | Description                                                                 | Status      | Version |\n|------------------|-----------------------------------------------------------------------------|-------------|---------|\n| Real-time chat   | Instant messaging with low latency                                          | ✅ Active    | 2.1.0   |\n| File sharing     | Share documents, images, and other files up to 100MB                         | ✅ Active    | 1.5.2   |\n| Video calls      | High-quality video conferencing with up to 50 participants                  | ⚠️ Beta     | 3.0.0   |\n| Screen sharing   | Share your screen with others in real-time                                  | ❌ Disabled  | 1.0.0   |",

      // Very wide multi-column table with extensive text
      "| Project Name | Team Lead | Department | Budget Allocation | Timeline | Key Deliverables | Risk Assessment | Success Metrics | Stakeholder Impact |\n|--------------|-----------|------------|-------------------|----------|------------------|-----------------|-----------------|--------------------|\n| Digital Transformation Initiative | Sarah Johnson | IT Operations | $2.5M over 18 months | Q1 2024 - Q2 2025 | Cloud migration, API modernization, legacy system retirement, staff training programs | Medium-High: Technical complexity, resource constraints, change management challenges | 40% cost reduction, 99.9% uptime, 50% faster deployment cycles | All departments affected, customer experience improvements expected |\n| Customer Experience Platform | Michael Chen | Product Development | $1.8M over 12 months | Q2 2024 - Q1 2025 | Mobile app redesign, personalization engine, analytics dashboard, A/B testing framework | Low-Medium: Market competition, user adoption, integration complexity | 25% increase in user engagement, 15% conversion rate improvement, 4.5+ app store rating | Direct impact on sales, marketing, and customer support teams |\n| Sustainability & Green Operations | Emma Rodriguez | Operations | $950K over 24 months | Q3 2024 - Q2 2026 | Carbon footprint reduction, renewable energy adoption, waste management optimization, supplier sustainability audits | Medium: Regulatory compliance, cost implications, supply chain disruption | 30% carbon reduction, 20% energy cost savings, ISO 14001 certification | Company-wide culture shift, regulatory compliance, brand reputation enhancement |",

      // Emoji-heavy table
      "| Activity | Mood | Energy Level | Recommendation | Fun Factor |\n|----------|------|--------------|----------------|------------|\n| 🏃‍♂️ Morning Run | 😊 Happy | ⚡⚡⚡ High | 👍 Highly Recommended | 🎉🎉🎉 |\n| 📚 Reading | 😌 Peaceful | ⚡⚡ Medium | 👌 Good Choice | 🎉🎉 |\n| 🎮 Gaming | 😄 Excited | ⚡⚡⚡⚡ Very High | 🤔 Depends on Time | 🎉🎉🎉🎉 |\n| 🧘‍♀️ Meditation | 😇 Zen | ⚡ Low | 💯 Essential | 🎉 |\n| 🍕 Pizza Night | 🤤 Craving | ⚡⚡ Medium | 😋 Weekend Only | 🎉🎉🎉🎉🎉 |\n| 💼 Work Meeting | 😐 Neutral | ⚡⚡ Medium | 📅 Necessary Evil | 😴 |",

      // Food & restaurant table with emojis
      "| Restaurant | Cuisine | Rating | Price Range | Specialties | Atmosphere | Delivery |\n|------------|---------|--------|-------------|-------------|------------|----------|\n| 🍜 Ramen Paradise | 🇯🇵 Japanese | ⭐⭐⭐⭐⭐ | 💰💰 | Tonkotsu, Miso, Shoyu ramen bowls | 🏮 Cozy & Authentic | 🚚 Yes |\n| 🌮 Taco Fiesta | 🇲🇽 Mexican | ⭐⭐⭐⭐ | 💰 | Street tacos, carnitas, fresh guac | 🎵 Lively & Colorful | 🚚 Yes |\n| 🍝 Nonna's Kitchen | 🇮🇹 Italian | ⭐⭐⭐⭐⭐ | 💰💰💰 | Handmade pasta, wood-fired pizza | 🕯️ Romantic & Elegant | ❌ No |\n| 🍔 Burger Junction | 🇺🇸 American | ⭐⭐⭐ | 💰💰 | Double cheeseburger, loaded fries | 🎸 Casual & Fun | 🚚 Yes |\n| 🥗 Green Garden | 🌱 Vegan | ⭐⭐⭐⭐ | 💰💰 | Buddha bowls, smoothies, raw desserts | 🌿 Fresh & Healthy | 🚚 Yes |",

      // Weather forecast table with emojis
      "| Day | Weather | Temperature | Humidity | Wind | UV Index | Activities |\n|-----|---------|-------------|----------|------|----------|------------|\n| Monday | ☀️ Sunny | 🌡️ 75°F / 24°C | 💧 45% | 🌬️ 8 mph | 🔆 High (8/10) | 🏖️ Beach day, 🚴‍♂️ cycling |\n| Tuesday | ⛅ Partly Cloudy | 🌡️ 72°F / 22°C | 💧 55% | 🌬️ 12 mph | 🔅 Medium (6/10) | 🥾 Hiking, 🎾 tennis |\n| Wednesday | 🌧️ Rainy | 🌡️ 68°F / 20°C | 💧 85% | 🌬️ 15 mph | ☁️ Low (2/10) | 📚 Indoor reading, 🎬 movies |\n| Thursday | ⛈️ Thunderstorms | 🌡️ 70°F / 21°C | 💧 90% | 🌬️ 20 mph | ☁️ Low (1/10) | 🏠 Stay indoors, ☕ coffee shop |\n| Friday | 🌤️ Mostly Sunny | 🌡️ 78°F / 26°C | 💧 40% | 🌬️ 6 mph | 🔆 High (9/10) | 🎉 Outdoor party, 🏊‍♀️ swimming |",

      // Table with code snippets
      "| Language   | Hello World Example                        |\n|------------|--------------------------------------------|\n| Python     | `print(\"Hello, World!\")`                   |\n| JavaScript | `console.log(\"Hello, World!\");`            |\n| Java       | `System.out.println(\"Hello, World!\");`     |\n| C++        | `std::cout << \"Hello, World!\" << std::endl;` |",

      // Gaming leaderboard with emojis
      "| Rank | Player | Score | Level | Achievements | Status | Streak |\n|------|--------|-------|-------|--------------|--------|--------|\n| 🥇 1st | DragonSlayer99 | 🎯 125,430 | ⚔️ Level 87 | 🏆 Champion, 💎 Diamond Tier | 🟢 Online | 🔥 15 days |\n| 🥈 2nd | MysticMage | 🎯 118,750 | 🧙‍♂️ Level 82 | 🌟 Master, 🎭 Legendary | 🟡 Away | 🔥 8 days |\n| 🥉 3rd | ShadowNinja | 🎯 112,890 | 🥷 Level 79 | ⚡ Speed Demon, 🎪 Trickster | 🟢 Online | 🔥 22 days |\n| 4th | CosmicWarrior | 🎯 108,340 | 🚀 Level 76 | 🌌 Explorer, 🛡️ Defender | 🔴 Offline | ❄️ 2 days |\n| 5th | PhoenixRider | 🎯 95,670 | 🔥 Level 71 | 🦅 Soaring High, 💪 Strength | 🟢 Online | 🔥 5 days |",

      // Project management table with extensive details
      "| Task ID | Task Name | Assigned To | Priority | Status | Start Date | Due Date | Estimated Hours | Actual Hours | Dependencies | Notes & Comments |\n|---------|-----------|-------------|----------|--------|------------|----------|-----------------|--------------|--------------|------------------|\n| TSK-001 | Database Schema Design | Alice Johnson | 🔴 Critical | ✅ Complete | 2024-01-15 | 2024-01-22 | 40 hours | 38 hours | None | Schema approved by architecture team. Minor revisions needed for user permissions table. |\n| TSK-002 | API Endpoint Development | Bob Smith | 🟠 High | 🔄 In Progress | 2024-01-20 | 2024-02-05 | 80 hours | 45 hours | TSK-001 | 60% complete. Authentication endpoints done. CRUD operations in progress. Need to implement rate limiting. |\n| TSK-003 | Frontend Component Library | Carol Davis | 🟡 Medium | 📋 Planned | 2024-02-01 | 2024-02-20 | 60 hours | 0 hours | TSK-002 | Waiting for API specs. Design system approved. Component wireframes ready for development. |\n| TSK-004 | Integration Testing Suite | David Wilson | 🟠 High | 📋 Planned | 2024-02-10 | 2024-02-25 | 50 hours | 0 hours | TSK-002, TSK-003 | Test cases documented. Automation framework selected. Waiting for components to be ready. |",

      // Table with links
      "| Resource        | URL                                | Notes                   |\n|-----------------|------------------------------------|-------------------------|\n| Documentation   | [docs.example.com](https://docs.example.com) | Comprehensive guides    |\n| API Reference   | [api.example.com](https://api.example.com)   | Interactive endpoints   |\n| Community Forum | [forum.example.com](https://forum.example.com) | User discussions        |",

      // Table with formatting
      "| Priority | Task           | Details                     | Deadline   |\n|----------|----------------|-----------------------------|------------|\n| **High** | _Code review_  | ~~Documentation~~           | 2023-10-15  |\n| *Medium*| **Testing**    | <br>Integration tests<br>   | 2023-11-01  |\n| Low      | Deployment     | `npm run deploy`            | 2023-12-01  |",

      // Complex table with multiple data types
      "| ID | Product Name     | Price  | In Stock | Last Updated       | Tags                    |\n|----|------------------|--------|----------|--------------------|-------------------------|\n| 1  | Laptop Pro       | $1299  | Yes      | 2023-09-15         | `electronics` `laptop`  |\n| 2  | Wireless Mouse   | $29.99 | No       | 2023-08-22         | `accessories` `wireless`|\n| 3  | Mechanical Keyboard| $89.99| Yes      | 2023-09-10         | `accessories` `gaming`  |",

      // Travel destinations with emojis
      "| Destination | Country | Best Season | Activities | Budget Level | Must-See Attractions |\n|-------------|---------|-------------|------------|--------------|----------------------|\n| 🗼 Tokyo | 🇯🇵 Japan | 🌸 Spring / 🍂 Fall | 🍜 Food tours, 🏛️ temples, 🛍️ shopping | 💰💰💰 High | Tokyo Tower, Senso-ji Temple, Shibuya Crossing |\n| 🏛️ Rome | 🇮🇹 Italy | 🌞 Late Spring / Early Fall | 🏺 History, 🍝 cuisine, 🎨 art | 💰💰 Medium | Colosseum, Vatican City, Trevi Fountain |\n| 🏝️ Bali | 🇮🇩 Indonesia | ☀️ Dry Season (Apr-Oct) | 🏄‍♂️ Surfing, 🧘‍♀️ yoga, 🌾 rice terraces | 💰 Low | Uluwatu Temple, Tegallalang Rice Terraces, Mount Batur |\n| 🗽 New York | 🇺🇸 USA | 🍂 Fall / 🌸 Spring | 🎭 Broadway, 🏛️ museums, 🌳 parks | 💰💰💰 High | Statue of Liberty, Central Park, Times Square |\n| 🦘 Sydney | 🇦🇺 Australia | 🌞 Summer (Dec-Feb) | 🏖️ Beaches, 🎪 opera, 🐨 wildlife | 💰💰💰 High | Opera House, Harbour Bridge, Bondi Beach |",

      // Table with line breaks and complex formatting
      "| Command | Description                          | Example Usage                   |\n|---------|--------------------------------------|---------------------------------|\n| git log | Show commit logs<br>with history     | `git log --oneline`<br>`git log --graph` |",

      // Simple data table
      "| Month    | Revenue | Expenses | Profit |\n|----------|---------|----------|--------|\n| January  | $10,000 | $7,000   | $3,000 |\n| February | $12,000 | $8,000   | $4,000 |\n| March    | $15,000 | $9,000   | $6,000 |",

      // Table with mixed content
      "| Item        | Quantity | Notes                          |\n|-------------|----------|--------------------------------|\n| Coffee      | 5 bags   | Preferably dark roast          |\n| Sugar       | 2 kg     | [Buy online](https://store.example.com) |\n| `Code files`| Unknown  | **Check repository**<br>for details |",

      // Minimalist table
      "| A | B | C |\n|---|---|---|\n| 1 | 2 | 3 |",

      // Heavy formatting table with extensive bold and italic text
      "| Feature Category | **Primary Benefits** | ***Implementation Details*** | **_Risk Factors_** | ***Success Indicators*** |\n|------------------|---------------------|----------------------------|-------------------|------------------------|\n| **_Advanced Analytics Platform_** | ***Dramatically improved*** decision-making capabilities through **real-time data processing** and _predictive modeling algorithms_ that can ***analyze millions of data points*** within seconds | **Multi-layered architecture** featuring _distributed computing nodes_, ***machine learning pipelines***, and **automated data validation** systems with _comprehensive error handling_ and ***fault-tolerant mechanisms*** | **_High complexity_** in integration with ***legacy systems***, potential **data privacy concerns**, and _significant training requirements_ for ***non-technical stakeholders*** | ***40% faster*** decision-making processes, **_95% accuracy_** in predictive models, and ***60% reduction*** in manual data analysis tasks |\n| **_Customer Engagement Suite_** | **Personalized user experiences** through _AI-driven recommendations_, ***omnichannel communication*** capabilities, and **real-time sentiment analysis** that ***adapts dynamically*** to customer behavior patterns | ***Cloud-native microservices*** architecture with **_containerized deployments_**, _API-first design principles_, and ***event-driven communication*** between services using **message queues** and _distributed caching_ | **_Scalability challenges_** during peak usage periods, ***potential security vulnerabilities*** in API endpoints, and **integration complexity** with _third-party marketing tools_ | **_25% increase_** in customer satisfaction scores, ***30% higher*** conversion rates, and **_50% reduction_** in customer service response times |\n| **_Automated Workflow Engine_** | ***Streamlined business processes*** through **intelligent task routing**, _automated approval workflows_, and ***real-time progress tracking*** with **comprehensive audit trails** and _detailed reporting capabilities_ | **_Rule-based automation_** engine with ***visual workflow designer***, **drag-and-drop interface** for _non-technical users_, and ***integration APIs*** for **custom business logic** implementation | ***Change management resistance*** from employees, **_potential job displacement concerns_**, and _complex debugging_ of ***automated decision trees*** | **_70% reduction_** in manual processing time, ***99.5% accuracy*** in automated tasks, and **_80% improvement_** in process compliance rates |",

      // Book/Literature review table with extensive formatting
      "| **Book Title** | ***Author*** | **_Genre & Themes_** | ***Critical Analysis*** | **_Reader Impact & Reception_** |\n|---------------|-------------|---------------------|------------------------|--------------------------------|\n| ***\"The Midnight Library\"*** | **_Matt Haig_** | **_Contemporary Fiction_** exploring themes of ***regret, possibility***, and **the infinite nature** of _human potential_ through ***philosophical storytelling*** | **_Masterfully crafted narrative_** that ***seamlessly blends*** **metaphysical concepts** with _deeply personal struggles_, creating a ***thought-provoking exploration*** of **life's infinite possibilities** and the **_weight of our choices_** | ***Overwhelmingly positive*** reader response with **_4.2/5 average rating_**, ***bestseller status*** across **multiple countries**, and **_profound emotional impact_** reported by ***85% of readers*** surveyed |\n| **_\"Klara and the Sun\"_** | ***Kazuo Ishiguro*** | ***Science Fiction*** with **_literary depth_**, exploring **artificial intelligence**, _human connection_, and ***the nature of love*** through the **_unique perspective_** of an ***artificial friend*** | **_Nobel laureate's masterpiece_** that ***brilliantly examines*** **consciousness and empathy** through _Klara's innocent yet profound observations_, creating a ***haunting meditation*** on **_what it means to be human_** | **_Critical acclaim_** with ***numerous literary awards***, **_strong commercial success_**, and ***deep philosophical discussions*** sparked in **book clubs** and _academic circles_ worldwide |\n| ***\"Project Hail Mary\"*** | **_Andy Weir_** | **_Hard Science Fiction_** combining ***rigorous scientific accuracy*** with **thrilling adventure**, exploring themes of **_sacrifice, friendship_**, and ***humanity's survival instinct*** | ***Expertly balances*** **complex scientific concepts** with _accessible storytelling_, creating a ***page-turning narrative*** that **_educates while entertaining_**, showcasing **remarkable character development** and _innovative plot structure_ | **_Phenomenal reader engagement_** with ***4.5/5 average rating***, **_viral social media presence_**, and ***strong crossover appeal*** attracting both **science fiction enthusiasts** and _mainstream readers_ |",

      // Software development methodology comparison with heavy formatting
      "| **_Methodology_** | ***Core Principles*** | **_Implementation Approach_** | ***Advantages & Strengths*** | **_Challenges & Limitations_** | ***Best Use Cases*** |\n|------------------|---------------------|------------------------------|----------------------------|------------------------------|---------------------|\n| ***Agile/Scrum*** | **_Iterative development_** with ***short sprints***, **continuous feedback** loops, and _adaptive planning_ that ***embraces change*** as a **fundamental aspect** of the development process | **_Daily standups_**, ***sprint planning sessions***, **retrospective meetings**, and _continuous integration_ with ***automated testing*** and **deployment pipelines** | ***Rapid response*** to **_changing requirements_**, **high team collaboration**, _improved product quality_ through ***continuous testing***, and **_faster time-to-market_** with ***incremental releases*** | **_Requires experienced team members_**, ***potential scope creep*** without proper **backlog management**, and **_difficulty in long-term planning_** for ***complex enterprise projects*** | ***Startups and small teams***, **_rapidly evolving products_**, **customer-facing applications** with _frequent updates_, and ***projects with unclear requirements*** |\n| **_DevOps Culture_** | ***Collaboration between*** **development and operations** teams, _automated infrastructure_, and ***continuous delivery*** with **_infrastructure as code_** principles | **_CI/CD pipelines_**, ***containerization strategies***, **monitoring and logging** systems, and _automated deployment_ with ***rollback capabilities*** | **_Faster deployment cycles_**, ***reduced manual errors***, **improved system reliability** through _automated monitoring_, and ***enhanced collaboration*** between **traditionally siloed teams** | ***Significant initial investment*** in **_tooling and training_**, **cultural resistance** to _organizational change_, and ***complexity in managing*** **_distributed systems_** | **_Large-scale applications_**, ***cloud-native architectures***, **enterprise systems** requiring _high availability_, and ***organizations seeking*** **_digital transformation_** |\n| ***Waterfall Methodology*** | **_Sequential development phases_** with ***clearly defined requirements***, **comprehensive documentation**, and _structured project management_ with ***milestone-based progress tracking*** | **_Detailed upfront planning_**, ***extensive documentation*** at each phase, **formal review processes**, and _rigid change control_ with ***approval hierarchies*** | ***Predictable timelines*** and **_budget estimates_**, **clear project milestones** with _measurable deliverables_, and ***comprehensive documentation*** for **_long-term maintenance_** | **_Inflexibility to changing requirements_**, ***late discovery of issues***, **limited customer feedback** during _development phases_, and ***high risk*** of **_project failure_** if requirements change | **_Regulated industries_** with ***strict compliance requirements***, **large government contracts** with _fixed specifications_, and ***projects with well-understood*** **_stable requirements_** |"
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
      const randomTable = tableSamples[Math.floor(Math.random() * tableSamples.length)];
      result.push(`Here's a markdown table for testing:\n\n${randomTable}`);
    }

    return result.join('\n\n');
  }
}

// Initialize ELIZA bot
const eliza = new ElizaBot();

// Global streaming speed multiplier (1x = baseline 50 tokens/second)
let streamingSpeedMultiplier = 1;

// Global request latency in milliseconds (baseline 50ms)
let requestLatency = 50;

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
      }, requestLatency);
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
