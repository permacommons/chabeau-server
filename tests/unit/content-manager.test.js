import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ContentManager from '../../lib/content-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock the ConfigLoader
vi.mock('../../lib/config-loader.js', () => {
  return {
    default: class MockConfigLoader {
      constructor(configPath) {
        this.configPath = configPath;
      }
      
      async loadConfig() {
        return {
          content: {
            'code-blocks': {
              enabled: true,
              languages: ['python', 'javascript', 'sql']
            },
            'long-responses': {
              enabled: true,
              max_paragraphs: 6
            },
            'rich-markdown': {
              enabled: true,
              max_paragraphs: 6
            },
            tables: {
              enabled: true,
              formats: ['markdown']
            },
            links: {
              enabled: true,
              complexity_levels: ['simple', 'complex', 'table-embedded']
            }
          },
          commands: {
            code_single: '@',
            code_multiple: '@@',
            code_many: '@@@'
          }
        };
      }
    }
  };
});

describe('ContentManager', () => {
  let contentManager;
  let testContentPath;
  
  beforeEach(async () => {
    // Create a temporary test content directory
    testContentPath = path.join(__dirname, '../fixtures/test-content');
    contentManager = new ContentManager(testContentPath);
    
    // Create test directory structure
    await fs.mkdir(testContentPath, { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'code-blocks'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'code-blocks', 'python'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'code-blocks', 'javascript'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'long-responses'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'rich-markdown'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'tables'), { recursive: true });
    await fs.mkdir(path.join(testContentPath, 'links'), { recursive: true });
  });
  
  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testContentPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Constructor', () => {
    it('should initialize with default content path', () => {
      const cm = new ContentManager();
      expect(cm.contentPath).toBe('./test-content');
      expect(cm.isLoaded).toBe(false);
      expect(cm.loadErrors).toEqual([]);
    });

    it('should initialize with custom content path', () => {
      const customPath = '/custom/path';
      const cm = new ContentManager(customPath);
      expect(cm.contentPath).toBe(customPath);
    });

    it('should initialize content registry with correct structure', () => {
      expect(contentManager.contentRegistry).toEqual({
        'code-blocks': {},
        'long-responses': [],
        'rich-markdown': [],
        'tables': [],
        'links': {},
        'terminal-breaking-emoji': [],
        'international-text': []
      });
    });
  });

  describe('Configuration Loading', () => {
    it('should load configuration successfully', async () => {
      await contentManager.loadContent();
      expect(contentManager.config).toBeDefined();
      expect(contentManager.config.content).toBeDefined();
      expect(contentManager.config.content['code-blocks']).toBeDefined();
    });
  });

  describe('Content Loading', () => {
    beforeEach(async () => {
      // Create test content files
      await fs.writeFile(
        path.join(testContentPath, 'code-blocks', 'python', 'test.py'),
        'def hello():\n    print("Hello, World!")'
      );
      
      await fs.writeFile(
        path.join(testContentPath, 'code-blocks', 'javascript', 'test.js'),
        'function hello() {\n    console.log("Hello, World!");\n}'
      );
      
      await fs.writeFile(
        path.join(testContentPath, 'long-responses', 'response1.txt'),
        'This is a test long response paragraph with meaningful content.'
      );

      await fs.writeFile(
        path.join(testContentPath, 'rich-markdown', 'rich-1.md'),
        'Money winks, and we pretend it is subtle.'
      );

      await fs.writeFile(
        path.join(testContentPath, 'tables', 'test-table.md'),
        '| Name | Age |\n|------|-----|\n| John | 30 |\n| Jane | 25 |'
      );
      
      await fs.writeFile(
        path.join(testContentPath, 'links', 'simple-links.txt'),
        'Check out https://example.com for more information.'
      );
    });

    it('should load all content categories successfully', async () => {
      await contentManager.loadContent();
      
      expect(contentManager.isLoaded).toBe(true);
      expect(contentManager.contentRegistry['code-blocks']['python']).toHaveLength(1);
      expect(contentManager.contentRegistry['code-blocks']['javascript']).toHaveLength(1);
      expect(contentManager.contentRegistry['long-responses']).toHaveLength(1);
      expect(contentManager.contentRegistry['rich-markdown']).toHaveLength(1);
      expect(contentManager.contentRegistry['tables']).toHaveLength(1);
      expect(contentManager.contentRegistry['links']['simple']).toHaveLength(1);
    });

    it('should handle missing directories gracefully', async () => {
      // Remove one directory
      await fs.rm(path.join(testContentPath, 'tables'), { recursive: true });
      
      await contentManager.loadContent();
      
      expect(contentManager.loadErrors).toContain('No table files found');
      expect(contentManager.contentRegistry['tables']).toHaveLength(0);
    });

    it('should skip empty files', async () => {
      // Create an empty file
      await fs.writeFile(path.join(testContentPath, 'long-responses', 'empty.txt'), '');
      
      await contentManager.loadContent();
      
      // Should only have the non-empty file
      expect(contentManager.contentRegistry['long-responses']).toHaveLength(1);
    });

    it('should skip hidden files', async () => {
      // Create hidden files
      await fs.writeFile(path.join(testContentPath, 'long-responses', '.hidden.txt'), 'Hidden content');
      await fs.writeFile(path.join(testContentPath, 'long-responses', '~backup.txt'), 'Backup content');
      
      await contentManager.loadContent();
      
      // Should only have the regular file
      expect(contentManager.contentRegistry['long-responses']).toHaveLength(1);
    });
  });

  describe('Content Selection', () => {
    beforeEach(async () => {
      // Create multiple test files for selection testing
      await fs.writeFile(
        path.join(testContentPath, 'code-blocks', 'python', 'fibonacci.py'),
        'def fibonacci(n):\n    return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)'
      );
      
      await fs.writeFile(
        path.join(testContentPath, 'code-blocks', 'python', 'hello.py'),
        'def hello():\n    print("Hello, World!")'
      );
      
      await fs.writeFile(
        path.join(testContentPath, 'long-responses', 'response1.txt'),
        'First response paragraph.'
      );
      
      await fs.writeFile(
        path.join(testContentPath, 'long-responses', 'response2.txt'),
        'Second response paragraph.'
      );

      await fs.writeFile(
        path.join(testContentPath, 'rich-markdown', 'rich-1.md'),
        'Money rehearses sincerity before every transaction.'
      );

      await fs.writeFile(
        path.join(testContentPath, 'rich-markdown', 'rich-2.md'),
        `---
Profit is the stand-up routine; risk is the heckler.`
      );

      await contentManager.loadContent();
    });

    it('should select random content from category', () => {
      const selected = contentManager._selectRandomContent('long-responses', 1);
      expect(selected).toHaveLength(1);
      expect(selected[0].category).toBe('long-responses');
    });

    it('should select multiple items when requested', () => {
      const selected = contentManager._selectRandomContent('long-responses', 2);
      expect(selected).toHaveLength(2);
    });

    it('should not exceed available content count', () => {
      const selected = contentManager._selectRandomContent('long-responses', 10);
      expect(selected).toHaveLength(2); // Only 2 files available
    });

    it('should filter code blocks by language', () => {
      const selected = contentManager._selectRandomContent('code-blocks', 1, { language: 'python' });
      expect(selected).toHaveLength(1);
      expect(selected[0].subcategory).toBe('python');
    });

    it('should return empty array for non-existent category', () => {
      const selected = contentManager._selectRandomContent('non-existent', 1);
      expect(selected).toHaveLength(0);
    });

    it('should select content from rich-markdown category', () => {
      const selected = contentManager._selectRandomContent('rich-markdown', 2);
      expect(selected).toHaveLength(2);
      selected.forEach(item => expect(item.category).toBe('rich-markdown'));
    });
  });

  describe('getCodeBlock', () => {
    beforeEach(async () => {
      await fs.writeFile(
        path.join(testContentPath, 'code-blocks', 'python', 'test.py'),
        'def hello():\n    print("Hello, World!")'
      );
      await contentManager.loadContent();
    });

    it('should return formatted code block', () => {
      const codeBlock = contentManager.getCodeBlock();
      expect(codeBlock).toMatch(/^```\w+\n[\s\S]*\n```$/);
    });

    it('should return code block for specific language', () => {
      const codeBlock = contentManager.getCodeBlock('python');
      expect(codeBlock).toMatch(/^```python\n[\s\S]*\n```$/);
    });

    it('should log guidance when content not loaded', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      contentManager.isLoaded = false;
      const codeBlock = contentManager.getCodeBlock('python');
      expect(codeBlock).toBe('');
      expect(errorSpy).toHaveBeenCalled();
      const [message] = errorSpy.mock.calls[0];
      expect(message).toContain('code block content');
      expect(message).toContain(path.join(testContentPath, 'code-blocks', 'python'));
      errorSpy.mockRestore();
    });

    it('should log guidance for non-existent language', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const codeBlock = contentManager.getCodeBlock('nonexistent');
      expect(codeBlock).toBe('');
      expect(errorSpy).toHaveBeenCalled();
      const [message] = errorSpy.mock.calls[0];
      expect(message).toContain('code block content');
      expect(message).toContain(path.join(testContentPath, 'code-blocks', 'nonexistent'));
      errorSpy.mockRestore();
    });
  });

  describe('getLongResponse', () => {
    beforeEach(async () => {
      await fs.writeFile(
        path.join(testContentPath, 'long-responses', 'response1.txt'),
        'First paragraph content.'
      );
      await fs.writeFile(
        path.join(testContentPath, 'long-responses', 'response2.txt'),
        'Second paragraph content.'
      );
      await contentManager.loadContent();
    });

    it('should return single paragraph by default', () => {
      const response = contentManager.getLongResponse();
      expect(response).toBeTruthy();
      expect(response.split('\n\n')).toHaveLength(1);
    });

    it('should return multiple paragraphs when requested', () => {
      const response = contentManager.getLongResponse(2);
      expect(response.split('\n\n')).toHaveLength(2);
    });

    it('should respect max_paragraphs configuration', () => {
      const response = contentManager.getLongResponse(10);
      // Should be limited by available content (2) and config max (6)
      expect(response.split('\n\n').length).toBeLessThanOrEqual(6);
    });

    it('should log guidance when content not loaded', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      contentManager.isLoaded = false;
      const response = contentManager.getLongResponse();
      expect(response).toBe('');
      expect(errorSpy).toHaveBeenCalled();
      const [message] = errorSpy.mock.calls[0];
      expect(message).toContain('long response content');
      expect(message).toContain(path.join(testContentPath, 'long-responses'));
      errorSpy.mockRestore();
    });
  });

  describe('getRichMarkdown', () => {
    beforeEach(async () => {
      await fs.writeFile(
        path.join(testContentPath, 'rich-markdown', 'rich-1.md'),
        `Money plays dress-up as virtue. 😏

![A velvet coin purse](https://example.com/purse.jpg)`
      );
      await fs.writeFile(
        path.join(testContentPath, 'rich-markdown', 'rich-2.md'),
        `---
Cashflow is just cardio with invoices. 💪💰`
      );
      await contentManager.loadContent();
    });

    it('should return single paragraph by default', () => {
      const content = contentManager.getRichMarkdown();
      expect(content).toBeTruthy();
      expect(content.split('\n\n').length).toBeGreaterThanOrEqual(1);
    });

    it('should return multiple paragraphs when requested', () => {
      const content = contentManager.getRichMarkdown(2);
      expect(content.split('\n\n').length).toBeGreaterThanOrEqual(2);
    });

    it('should log guidance when content not loaded', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      contentManager.isLoaded = false;
      const content = contentManager.getRichMarkdown();
      expect(content).toBe('');
      expect(errorSpy).toHaveBeenCalled();
      const [message] = errorSpy.mock.calls[0];
      expect(message).toContain('rich markdown content');
      expect(message).toContain(path.join(testContentPath, 'rich-markdown'));
      errorSpy.mockRestore();
    });
  });

  describe('getMarkdownTable', () => {
    beforeEach(async () => {
      await fs.writeFile(
        path.join(testContentPath, 'tables', 'test-table.md'),
        '| Name | Age |\n|------|-----|\n| John | 30 |'
      );
      await contentManager.loadContent();
    });

    it('should return markdown table', () => {
      const table = contentManager.getMarkdownTable();
      expect(table).toContain('|');
      expect(table).toContain('Name');
      expect(table).toContain('Age');
    });

    it('should log guidance when content not loaded', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      contentManager.isLoaded = false;
      const table = contentManager.getMarkdownTable();
      expect(table).toBe('');
      expect(errorSpy).toHaveBeenCalled();
      const [message] = errorSpy.mock.calls[0];
      expect(message).toContain('markdown table content');
      expect(message).toContain(path.join(testContentPath, 'tables'));
      errorSpy.mockRestore();
    });
  });

  describe('getLinkedContent', () => {
    beforeEach(async () => {
      await fs.writeFile(
        path.join(testContentPath, 'links', 'simple-links.txt'),
        'Visit https://example.com for more info.'
      );
      await fs.writeFile(
        path.join(testContentPath, 'links', 'complex-links.md'),
        'Check out [our docs](https://docs.example.com) for details.'
      );
      await contentManager.loadContent();
    });

    it('should return simple links by default', () => {
      const content = contentManager.getLinkedContent();
      expect(content).toContain('https://');
    });

    it('should return complex links when requested', () => {
      const content = contentManager.getLinkedContent(2);
      expect(content).toBeTruthy();
    });

    it('should log guidance when content not loaded', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      contentManager.isLoaded = false;
      const content = contentManager.getLinkedContent();
      expect(content).toBe('');
      expect(errorSpy).toHaveBeenCalled();
      const [message] = errorSpy.mock.calls[0];
      expect(message).toContain('linked content');
      expect(message).toContain(path.join(testContentPath, 'links'));
      errorSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors gracefully', async () => {
      // Create a file then make it unreadable
      const filePath = path.join(testContentPath, 'long-responses', 'test.txt');
      await fs.writeFile(filePath, 'test content');
      
      // Mock fs.readFile to throw an error
      const originalReadFile = fs.readFile;
      vi.spyOn(fs, 'readFile').mockRejectedValueOnce(new Error('Permission denied'));
      
      await contentManager.loadContent();
      
      expect(contentManager.loadErrors.length).toBeGreaterThan(0);
      
      // Restore original function
      fs.readFile.mockRestore();
    });

    it('should handle malformed configuration gracefully', async () => {
      // Mock ConfigLoader to throw an error
      vi.spyOn(contentManager.configLoader, 'loadConfig').mockRejectedValueOnce(
        new Error('Invalid TOML syntax')
      );
      
      await contentManager.loadContent();
      
      expect(contentManager.isLoaded).toBe(false);
      expect(contentManager.loadErrors).toContain('Critical error: Invalid TOML syntax');
    });

    it('should continue loading other categories when one fails', async () => {
      // Create valid content in one category
      await fs.writeFile(
        path.join(testContentPath, 'long-responses', 'response.txt'),
        'Valid content'
      );
      
      // Mock directory scanning to fail for code-blocks
      const originalScanDirectory = contentManager._scanDirectory;
      vi.spyOn(contentManager, '_scanDirectory').mockImplementation(async (dirPath, category) => {
        if (category === 'code-blocks') {
          throw new Error('Scan failed');
        }
        return originalScanDirectory.call(contentManager, dirPath, category);
      });
      
      await contentManager.loadContent();
      
      // Should have loaded long-responses despite code-blocks failure
      expect(contentManager.contentRegistry['long-responses']).toHaveLength(1);
      expect(contentManager.loadErrors.some(error => error.includes('code blocks'))).toBe(true);
    });
  });

  describe('getStatus', () => {
    beforeEach(async () => {
      await fs.writeFile(
        path.join(testContentPath, 'code-blocks', 'python', 'test.py'),
        'print("test")'
      );
      await fs.writeFile(
        path.join(testContentPath, 'long-responses', 'response.txt'),
        'Test response'
      );
      await fs.writeFile(
        path.join(testContentPath, 'rich-markdown', 'rich.md'),
        'Money has a punchline, and we keep laughing.'
      );
      await contentManager.loadContent();
    });

    it('should return comprehensive status information', () => {
      const status = contentManager.getStatus();
      
      expect(status).toHaveProperty('isLoaded');
      expect(status).toHaveProperty('totalContent');
      expect(status).toHaveProperty('contentBreakdown');
      expect(status).toHaveProperty('errors');
      expect(status).toHaveProperty('configPath');
      expect(status).toHaveProperty('contentPath');
      
      expect(status.contentBreakdown).toHaveProperty('codeBlocks');
      expect(status.contentBreakdown).toHaveProperty('longResponses');
      expect(status.contentBreakdown).toHaveProperty('richMarkdown');
      expect(status.contentBreakdown).toHaveProperty('tables');
      expect(status.contentBreakdown).toHaveProperty('links');
    });

    it('should report correct content counts', () => {
      const status = contentManager.getStatus();

      expect(status.totalContent).toBe(3);
      expect(status.contentBreakdown.codeBlocks.total).toBe(1);
      expect(status.contentBreakdown.longResponses).toBe(1);
      expect(status.contentBreakdown.richMarkdown).toBe(1);
      expect(status.contentBreakdown.tables).toBe(0);
      expect(status.contentBreakdown.links.total).toBe(0);
    });
  });

});