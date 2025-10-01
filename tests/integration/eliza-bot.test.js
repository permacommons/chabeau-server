import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ElizaBot } from '../../eliza-bot.js';

describe('ElizaBot Integration Tests', () => {
  let bot;
  let testContentPath;
  
  beforeEach(async () => {
    
    // Create a temporary test content directory
    testContentPath = path.join(__dirname, '../fixtures/integration-test-content');
    
    // Create test directory structure
    await fs.mkdir(testContentPath, { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'code-blocks'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'code-blocks', 'python'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'code-blocks', 'javascript'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'long-responses'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'tables'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'links'), { recursive: true });
    
    // Create test content files
    await fs.writeFile(
      path.join(testContentPath, 'config.toml'),
      `[content]
[content.code-blocks]
enabled = true
languages = ["python", "javascript"]

[content.long-responses]
enabled = true
max_paragraphs = 6

[content.tables]
enabled = true
formats = ["markdown"]

[content.links]
enabled = true
complexity_levels = ["simple", "complex", "table-embedded"]

[commands]
code_single = "@"
code_multiple = "@@"
code_many = "@@@"`
    );
    
    await fs.writeFile(
      path.join(testContentPath, 'code-blocks', 'python', 'test.py'),
      'def hello_world():\n    print("Hello, World!")\n\nhello_world()'
    );
    
    await fs.writeFile(
      path.join(testContentPath, 'code-blocks', 'javascript', 'test.js'),
      'function helloWorld() {\n    console.log("Hello, World!");\n}\n\nhelloWorld();'
    );
    
    await fs.writeFile(
      path.join(testContentPath, 'long-responses', 'response1.txt'),
      'This is a test response paragraph that demonstrates the long response functionality of the content management system.'
    );
    
    await fs.writeFile(
      path.join(testContentPath, 'long-responses', 'response2.txt'),
      'Another test paragraph that provides additional content for testing multiple paragraph responses.'
    );
    
    await fs.writeFile(
      path.join(testContentPath, 'tables', 'test-table.md'),
      '| Feature | Status | Priority |\n|---------|--------|---------|\n| Testing | Active | High |\n| Documentation | Complete | Medium |'
    );
    
    await fs.writeFile(
      path.join(testContentPath, 'links', 'simple-links.txt'),
      'Visit https://example.com for more information about our services.'
    );
    
    await fs.writeFile(
      path.join(testContentPath, 'links', 'complex-links.md'),
      'Check out our [documentation](https://docs.example.com) and [API reference](https://api.example.com) for detailed information.'
    );

    await fs.writeFile(
      path.join(testContentPath, 'links', 'table-links.md'),
      '| Resource | Link |\n|----------|------|\n| Status Dashboard | [Uptime](https://status.example.com) |\n| Feature Roadmap | [Projects](https://projects.example.com) |'
    );

    // Create bot instance with test content path
    bot = new ElizaBot();
    bot.contentManager.contentPath = testContentPath;
    
    // Wait for content to load
    await bot.contentManager.loadContent();
  });
  
  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testContentPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
    
    // Reset global variables
    global.streamingSpeedMultiplier = 1;
    global.requestLatency = 50;
  });

  describe('Basic ELIZA Functionality', () => {
    it('should respond to basic ELIZA patterns', () => {
      const response = bot.respond('I need help');
      expect(response).toMatch(/Why do you need|Would it really help|Are you sure you need/);
    });

    it('should respond to "I am" patterns', () => {
      const response = bot.respond('I am confused');
      expect(response).toMatch(/Did you come to me because|How long have you been|How do you feel about being/);
    });

    it('should respond to questions', () => {
      const response = bot.respond('What should I do?');
      expect(response).toMatch(/Why do you ask|How would an answer|What do you think/);
    });

    it('should provide default responses for unmatched input', () => {
      const response = bot.respond('random unmatched input');
      expect(response).toMatch(/Please tell me more|Let's change focus|Can you elaborate|Why do you say that|I see|Very interesting|How does that make you feel|How do you feel when you say that/);
    });

    it('should handle empty input gracefully', () => {
      const response = bot.respond('');
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
    });
  });

  describe('Code Block Generation', () => {
    it('should generate single code block with @ command', () => {
      const response = bot.respond('@');
      expect(response).toMatch(/^```\w+\n[\s\S]*\n```$/);
      expect(response).toContain('Hello, World!');
    });

    it('should generate multiple code blocks with @@ command', () => {
      const response = bot.respond('@@');
      // Count actual code blocks by counting ``` markers
      const codeBlockCount = (response.match(/```\w+/g) || []).length;
      expect(codeBlockCount).toBe(3);
      expect(response).toMatch(/```\w+\n[\s\S]*\n```/);
    });

    it('should generate many code blocks with @@@ command', () => {
      const response = bot.respond('@@@');
      // Count actual code blocks by counting ``` markers
      const codeBlockCount = (response.match(/```\w+/g) || []).length;
      expect(codeBlockCount).toBe(5);
      expect(response).toMatch(/```\w+\n[\s\S]*\n```/);
    });

    it('should use filesystem content when available', () => {
      const response = bot.respond('@');
      // Should contain content from our test files
      expect(response).toMatch(/hello_world|helloWorld/);
    });

    it('should log guidance when content unavailable', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Temporarily break content loading
      bot.contentManager.isLoaded = false;

      const response = bot.respond('@');
      expect(response).toBe('');
      expect(errorSpy).toHaveBeenCalled();
      const [message] = errorSpy.mock.calls[0];
      expect(message).toContain('code block content');
      expect(message).toContain(path.join(testContentPath, 'code-blocks'));
      errorSpy.mockRestore();
    });
  });

  describe('Long Response Generation', () => {
    it('should generate single paragraph with ! command', () => {
      const response = bot.respond('!');
      expect(response).toBeTruthy();
      expect(response.split('\n\n')).toHaveLength(1);
    });

    it('should generate multiple paragraphs with !! command', () => {
      const response = bot.respond('!!');
      expect(response).toBeTruthy();
      const paragraphs = response.split('\n\n');
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);
      expect(paragraphs.length).toBeLessThanOrEqual(2);
    });

    it('should generate many paragraphs with !!! command', () => {
      const response = bot.respond('!!!');
      expect(response).toBeTruthy();
      const paragraphs = response.split('\n\n');
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);
      expect(paragraphs.length).toBeLessThanOrEqual(3);
    });

    it('should use filesystem content when available', () => {
      const response = bot.respond('!');
      // Should contain content from our test files
      expect(response).toMatch(/test response paragraph|content management system|test paragraph|additional content/);
    });

    it('should log guidance when content unavailable', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Temporarily break content loading
      bot.contentManager.isLoaded = false;

      const response = bot.respond('!');
      expect(response).toBe('');
      expect(errorSpy).toHaveBeenCalled();
      const [message] = errorSpy.mock.calls[0];
      expect(message).toContain('long response content');
      expect(message).toContain(path.join(testContentPath, 'long-responses'));
      errorSpy.mockRestore();
    });
  });

  describe('Markdown Table Generation', () => {
    it('should generate single table with | command', () => {
      const response = bot.respond('|');
      expect(response).toContain('|');
      expect(response).toMatch(/\|.*\|.*\|/); // Should have table structure
    });

    it('should generate multiple tables with || command', () => {
      const response = bot.respond('||');
      expect(response).toContain('|');
      // Should have multiple table sections
      const tableCount = (response.match(/\|.*\|.*\|/g) || []).length;
      expect(tableCount).toBeGreaterThan(1);
    });

    it('should generate many tables with ||| command', () => {
      const response = bot.respond('|||');
      expect(response).toContain('|');
      // Should have multiple table sections
      const tableCount = (response.match(/\|.*\|.*\|/g) || []).length;
      expect(tableCount).toBeGreaterThan(2);
    });

    it('should use filesystem content when available', () => {
      const response = bot.respond('|');
      // Should contain content from our test files
      expect(response).toMatch(/Feature|Status|Priority|Testing|Documentation/);
    });

    it('should log guidance when content unavailable', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Temporarily break content loading
      bot.contentManager.isLoaded = false;

      const response = bot.respond('|');
      expect(response).toBe('');
      expect(errorSpy).toHaveBeenCalled();
      const [message] = errorSpy.mock.calls[0];
      expect(message).toContain('markdown table content');
      expect(message).toContain(path.join(testContentPath, 'tables'));
      errorSpy.mockRestore();
    });
  });

  describe('Linked Content Generation', () => {
    it('should generate simple links with % command', () => {
      const response = bot.respond('%');
      expect(response).toMatch(/https?:\/\/[^\s]+/);
    });

    it('should generate complex links with %% command', () => {
      const response = bot.respond('%%');
      expect(response).toBeTruthy();
      // Should contain either URLs or markdown links
      expect(response).toMatch(/https?:\/\/[^\s]+|\[.*\]\(.*\)/);
    });

    it('should generate advanced links with %%% command', () => {
      const response = bot.respond('%%%');
      expect(response).toBeTruthy();
      // Should contain either URLs, markdown links, or table structure
      expect(response).toMatch(/https?:\/\/[^\s]+|\[.*\]\(.*\)|\|.*\|/);
    });

    it('should use filesystem content when available', () => {
      const response = bot.respond('%');
      // Should contain content from our test files
      expect(response).toMatch(/example\.com|documentation|API reference/);
    });

    it('should log guidance when content unavailable', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Temporarily break content loading
      bot.contentManager.isLoaded = false;

      const response = bot.respond('%');
      expect(response).toBe('');
      expect(errorSpy).toHaveBeenCalled();
      const [message] = errorSpy.mock.calls[0];
      expect(message).toContain('linked content');
      expect(message).toContain(path.join(testContentPath, 'links'));
      errorSpy.mockRestore();
    });
  });

  describe('Speed Control Patterns', () => {
    beforeEach(() => {
      // Reset global variables
      global.streamingSpeedMultiplier = 1;
    });

    it('should handle speed increase commands', () => {
      let response = bot.respond('>');
      expect(global.streamingSpeedMultiplier).toBe(5);
      expect(response).toContain('5x baseline');

      response = bot.respond('>>');
      expect(global.streamingSpeedMultiplier).toBe(10);
      expect(response).toContain('10x baseline');

      response = bot.respond('>>>');
      expect(global.streamingSpeedMultiplier).toBe(100);
      expect(response).toContain('100x baseline');
    });

    it('should handle speed decrease commands', () => {
      // Start at high speed
      global.streamingSpeedMultiplier = 100;

      let response = bot.respond('<');
      expect(global.streamingSpeedMultiplier).toBe(10);
      expect(response).toContain('10x baseline');

      response = bot.respond('<');
      expect(global.streamingSpeedMultiplier).toBe(5);
      expect(response).toContain('5x baseline');

      response = bot.respond('<');
      expect(global.streamingSpeedMultiplier).toBe(1);
      expect(response).toContain('baseline');
    });

    it('should handle reset to baseline', () => {
      global.streamingSpeedMultiplier = 100;
      
      const response = bot.respond('<<<');
      expect(global.streamingSpeedMultiplier).toBe(1);
      expect(response).toContain('baseline');
    });

    it('should handle multi-level decreases', () => {
      global.streamingSpeedMultiplier = 100;
      
      let response = bot.respond('<<');
      expect(global.streamingSpeedMultiplier).toBe(5);
      expect(response).toContain('5x baseline');

      global.streamingSpeedMultiplier = 10;
      response = bot.respond('<<');
      expect(global.streamingSpeedMultiplier).toBe(1);
      expect(response).toContain('baseline');
    });
  });

  describe('Latency Control Patterns', () => {
    beforeEach(() => {
      // Reset global variables
      global.requestLatency = 50;
    });

    it('should handle latency increase commands', () => {
      let response = bot.respond(')');
      expect(global.requestLatency).toBe(500);
      expect(response).toContain('500 milliseconds');

      response = bot.respond('))');
      expect(global.requestLatency).toBe(2500);
      expect(response).toContain('2.5 seconds');

      response = bot.respond(')))');
      expect(global.requestLatency).toBe(5000);
      expect(response).toContain('5 seconds');
    });

    it('should handle latency decrease commands', () => {
      // Start at high latency
      global.requestLatency = 5000;

      let response = bot.respond('(');
      expect(global.requestLatency).toBe(2500);
      expect(response).toContain('2.5 seconds');

      response = bot.respond('(');
      expect(global.requestLatency).toBe(500);
      expect(response).toContain('500 milliseconds');

      response = bot.respond('(');
      expect(global.requestLatency).toBe(50);
      expect(response).toContain('baseline');
    });

    it('should handle reset to baseline', () => {
      global.requestLatency = 5000;
      
      const response = bot.respond('(((');
      expect(global.requestLatency).toBe(50);
      expect(response).toContain('baseline');
    });

    it('should handle multi-level decreases', () => {
      global.requestLatency = 5000;
      
      let response = bot.respond('((');
      expect(global.requestLatency).toBe(500);
      expect(response).toContain('500 milliseconds');

      global.requestLatency = 2500;
      response = bot.respond('((');
      expect(global.requestLatency).toBe(50);
      expect(response).toContain('baseline');
    });
  });

  describe('Error Handling and Missing Content Behavior', () => {
    it('should handle content loading failures gracefully', async () => {
      // Create a bot with invalid content path
      const invalidBot = new ElizaBot();
      invalidBot.contentManager.contentPath = '/nonexistent/path';

      // Try to load content (should fail)
      await invalidBot.contentManager.loadContent();

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Bot should still respond to commands without crashing
      const response = invalidBot.respond('@');
      expect(response).toBe('');

      const messages = errorSpy.mock.calls.map(call => call[0]);
      expect(messages.some(msg => msg.includes('code block content'))).toBe(true);
      expect(messages.some(msg => msg.includes(path.join('/nonexistent/path', 'code-blocks')))).toBe(true);

      errorSpy.mockRestore();
    });

    it('should maintain ELIZA functionality when content system fails', () => {
      // Break the content manager
      bot.contentManager.isLoaded = false;
      
      // ELIZA patterns should still work
      const response = bot.respond('I need help');
      expect(response).toMatch(/Why do you need|Would it really help|Are you sure you need/);
    });

    it('should handle mixed content availability', async () => {
      // Remove some content categories
      await fs.rm(path.join(testContentPath, 'tables'), { recursive: true });

      // Reload content
      await bot.contentManager.loadContent();

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Code blocks should work (content available)
      const codeResponse = bot.respond('@');
      expect(codeResponse).toMatch(/^```\w+\n[\s\S]*\n```$/);

      // Tables should log guidance when content unavailable
      const tableResponse = bot.respond('|');
      expect(tableResponse).toBe('');

      const messages = errorSpy.mock.calls.map(call => call[0]);
      expect(messages.some(msg => msg.includes('markdown table content'))).toBe(true);
      expect(messages.some(msg => msg.includes(path.join(testContentPath, 'tables')))).toBe(true);

      errorSpy.mockRestore();
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain exact same command patterns as before', () => {
      const commands = [
        '@', '@@', '@@@',
        '!', '!!, !!!',
        '|', '||', '|||',
        '%', '%%', '%%%',
        '>', '>>', '>>>',
        '<', '<<', '<<<',
        ')', '))', ')))',
        '(', '((', '((('
      ];

      commands.forEach(command => {
        const response = bot.respond(command);
        expect(response).toBeTruthy();
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
      });
    });

    it('should preserve ELIZA conversation patterns', () => {
      const elizaInputs = [
        'I need help',
        'I am sad',
        'Why can\'t I be happy?',
        'Hello',
        'I think you are wrong',
        'Yes',
        'Can you help me?'
      ];

      elizaInputs.forEach(input => {
        const response = bot.respond(input);
        expect(response).toBeTruthy();
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
        // Should not be a control pattern response
        expect(response).not.toMatch(/baseline|speed|latency|milliseconds|seconds/);
      });
    });

    it('should maintain response format consistency', () => {
      // Code blocks should be properly formatted
      const codeResponse = bot.respond('@');
      expect(codeResponse).toMatch(/^```\w+\n[\s\S]*\n```$/);

      // Tables should have proper markdown structure
      const tableResponse = bot.respond('|');
      expect(tableResponse).toMatch(/\|.*\|.*\|/);

      // Links should contain URLs or markdown links
      const linkResponse = bot.respond('%');
      expect(linkResponse).toMatch(/https?:\/\/[^\s]+|\[.*\]\(.*\)/);
    });
  });

  describe('Content Quality and Variety', () => {
    it('should provide varied code block content', () => {
      const responses = [];
      for (let i = 0; i < 10; i++) {
        responses.push(bot.respond('@'));
      }
      
      // Should have some variety (not all identical)
      const uniqueResponses = new Set(responses);
      expect(uniqueResponses.size).toBeGreaterThan(1);
    });

    it('should provide varied long response content', () => {
      const responses = [];
      for (let i = 0; i < 10; i++) {
        responses.push(bot.respond('!'));
      }
      
      // Should have some variety (not all identical)
      const uniqueResponses = new Set(responses);
      expect(uniqueResponses.size).toBeGreaterThan(1);
    });

    it('should maintain content quality standards', () => {
      // Code blocks should be syntactically reasonable
      const codeResponse = bot.respond('@');
      expect(codeResponse).toMatch(/^```\w+\n[\s\S]*\n```$/);
      expect(codeResponse).not.toContain('undefined');
      expect(codeResponse).not.toContain('null');

      // Long responses should be coherent text
      const longResponse = bot.respond('!');
      expect(longResponse.length).toBeGreaterThan(50); // Reasonable length
      expect(longResponse).toMatch(/[a-zA-Z]/); // Contains letters
      expect(longResponse).not.toMatch(/^\s*$/); // Not just whitespace
    });
  });
});