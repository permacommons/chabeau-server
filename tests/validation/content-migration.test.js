import { describe, it, expect, beforeAll, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ContentManager from '../../lib/content-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Content Migration Validation', () => {
  let contentManager;
  let contentStatus;
  
  beforeAll(async () => {
    // Use the actual test-content directory
    contentManager = new ContentManager('./test-content');
    await contentManager.loadContent();
    contentStatus = contentManager.getStatus();
  });

  describe('Directory Structure Validation', () => {
    it('should have all required content directories', async () => {
      const requiredDirs = [
        'test-content',
        'test-content/code-blocks',
        'test-content/long-responses',
        'test-content/rich-markdown',
        'test-content/tables',
        'test-content/links',
        'test-content/terminal-breaking-emoji',
        'test-content/international-text'
      ];

      for (const dir of requiredDirs) {
        try {
          const stats = await fs.stat(dir);
          expect(stats.isDirectory()).toBe(true);
        } catch (error) {
          throw new Error(`Required directory missing: ${dir}`);
        }
      }
    });

    it('should have language-specific subdirectories for code blocks', async () => {
      const expectedLanguages = [
        'python', 'javascript', 'sql', 'bash', 'html', 'css', 
        'java', 'cpp', 'go', 'rust'
      ];

      for (const lang of expectedLanguages) {
        const langDir = path.join('test-content', 'code-blocks', lang);
        try {
          const stats = await fs.stat(langDir);
          expect(stats.isDirectory()).toBe(true);
        } catch (error) {
          throw new Error(`Language directory missing: ${langDir}`);
        }
      }
    });

    it('should have configuration file', async () => {
      const configPath = 'test-content/config.toml';
      try {
        const stats = await fs.stat(configPath);
        expect(stats.isFile()).toBe(true);
      } catch (error) {
        throw new Error(`Configuration file missing: ${configPath}`);
      }
    });
  });

  describe('Content Availability Validation', () => {
    it('should have loaded content from all categories', () => {
      expect(contentStatus.isLoaded).toBe(true);
      expect(contentStatus.totalContent).toBeGreaterThan(0);
    });

    it('should have code blocks for multiple languages', () => {
      expect(contentStatus.contentBreakdown.codeBlocks.total).toBeGreaterThan(0);
      expect(contentStatus.contentBreakdown.codeBlocks.languages).toBeGreaterThan(5);
    });

    it('should have long response content', () => {
      expect(contentStatus.contentBreakdown.longResponses).toBeGreaterThan(0);
    });

    it('should have rich markdown content', () => {
      expect(contentStatus.contentBreakdown.richMarkdown).toBeGreaterThan(0);
    });

    it('should have table content', () => {
      expect(contentStatus.contentBreakdown.tables).toBeGreaterThan(0);
    });

    it('should have link content with multiple complexity levels', () => {
      expect(contentStatus.contentBreakdown.links.total).toBeGreaterThan(0);
      expect(contentStatus.contentBreakdown.links.complexityLevels).toBeGreaterThan(1);
    });

    it('should have minimal errors during content loading', () => {
      // Some errors are acceptable (e.g., missing optional files)
      // but there shouldn't be critical failures
      expect(contentStatus.errors.length).toBeLessThan(5);
      
      // Check that no critical errors occurred
      const criticalErrors = contentStatus.errors.filter(error => 
        error.includes('Critical error') || error.includes('Failed to load')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });

  describe('Content Quality Validation', () => {
    it('should have properly formatted code blocks', () => {
      const codeBlock = contentManager.getCodeBlock();
      
      // Should be properly formatted markdown code block
      expect(codeBlock).toMatch(/^```\w+\n[\s\S]*\n```$/);
      
      // Should contain actual code content
      expect(codeBlock.length).toBeGreaterThan(50);
      
      // Should not contain placeholder text
      expect(codeBlock).not.toContain('TODO');
      expect(codeBlock).not.toContain('PLACEHOLDER');
      expect(codeBlock).not.toContain('undefined');
    });

    it('should have meaningful long response content', () => {
      const response = contentManager.getLongResponse();
      
      // Should be substantial content
      expect(response.length).toBeGreaterThan(100);
      
      // Should contain actual sentences
      expect(response).toMatch(/[A-Z][^.!?]*[.!?]/);
      
      // Should not be just whitespace or placeholder
      expect(response.trim()).toBeTruthy();
      expect(response).not.toContain('Lorem ipsum');
      expect(response).not.toContain('PLACEHOLDER');
    });

    it('should have properly formatted markdown tables', () => {
      const table = contentManager.getMarkdownTable();
      
      // Should have table structure
      expect(table).toContain('|');
      expect(table).toMatch(/\|.*\|.*\|/);
      
      // Should have headers and data
      const lines = table.split('\n').filter(line => line.trim());
      expect(lines.length).toBeGreaterThan(2); // At least header, separator, and one data row
      
      // Should not contain placeholder content
      expect(table).not.toContain('PLACEHOLDER');
      expect(table).not.toContain('TODO');
    });

    it('should have valid link content', () => {
      const linkContent = contentManager.getLinkedContent();
      
      // Should contain URLs or markdown links
      const hasUrls = /https?:\/\/[^\s]+/.test(linkContent);
      const hasMarkdownLinks = /\[.*\]\(.*\)/.test(linkContent);
      
      expect(hasUrls || hasMarkdownLinks).toBe(true);
      
      // Should not contain placeholder content
      expect(linkContent).not.toContain('PLACEHOLDER');
      expect(linkContent).not.toContain('TODO');
      
      // Should have meaningful content (not just empty placeholders)
      expect(linkContent.length).toBeGreaterThan(20);
    });

    it('should have expressive rich markdown content', () => {
      const richContent = contentManager.getRichMarkdown(2);

      expect(richContent.length).toBeGreaterThan(80);
      expect(richContent).toMatch(/---|\!\[.*\]\(.*\)/);
      expect(richContent).toMatch(/[😏💰✨🐶💸]/);
    });
  });

  describe('Content Variety Validation', () => {
    it('should provide variety in code block languages', () => {
      const languages = new Set();
      
      // Sample multiple code blocks to check variety
      for (let i = 0; i < 10; i++) {
        const codeBlock = contentManager.getCodeBlock();
        const match = codeBlock.match(/^```(\w+)/);
        if (match) {
          languages.add(match[1]);
        }
      }
      
      // Should have at least 3 different languages
      expect(languages.size).toBeGreaterThanOrEqual(3);
    });

    it('should provide variety in long responses', () => {
      const responses = new Set();
      
      // Sample multiple responses to check variety
      for (let i = 0; i < 5; i++) {
        const response = contentManager.getLongResponse();
        responses.add(response);
      }
      
      // Should have some variety (not all identical) if multiple responses exist
      const responseCount = contentManager.contentRegistry['long-responses'].length;
      if (responseCount > 1) {
        expect(responses.size).toBeGreaterThan(1);
      } else {
        // If only one response exists, just verify we got content
        expect(responses.size).toBe(1);
      }
    });

    it('should provide variety in table content', () => {
      const tables = new Set();
      
      // Sample multiple tables to check variety
      for (let i = 0; i < 3; i++) {
        const table = contentManager.getMarkdownTable();
        tables.add(table);
      }
      
      // Should have some variety (not all identical) if multiple tables exist
      const tableCount = contentManager.contentRegistry['tables'].length;
      if (tableCount > 1) {
        expect(tables.size).toBeGreaterThan(1);
      } else {
        // If only one table exists, just verify we got content
        expect(tables.size).toBe(1);
      }
    });

    it('should support different link complexity levels', () => {
      const simple = contentManager.getLinkedContent(1);
      const complex = contentManager.getLinkedContent(2);
      const advanced = contentManager.getLinkedContent(3);
      
      // Verify we got content for each level
      expect(simple.length).toBeGreaterThan(0);
      expect(complex.length).toBeGreaterThan(0);
      expect(advanced.length).toBeGreaterThan(0);
      
      // Check if we have multiple files per complexity level
      const simpleCount = contentManager.contentRegistry['links']['simple']?.length || 0;
      const complexCount = contentManager.contentRegistry['links']['complex']?.length || 0;
      const advancedCount = contentManager.contentRegistry['links']['table-embedded']?.length || 0;
      
      // Only expect different content if multiple files exist at each level
      if (simpleCount > 1 || complexCount > 1 || advancedCount > 1) {
        // At least some should be different
        const allSame = (simple === complex && complex === advanced);
        expect(allSame).toBe(false);
      }
      
      // Should all contain links or URLs
      [simple, complex, advanced].forEach(content => {
        const hasLinks = /https?:\/\/[^\s]+|\[.*\]\(.*\)|\|.*\|/.test(content);
        expect(hasLinks).toBe(true);
      });
    });
  });

  describe('File Organization Standards Validation', () => {
    it('should follow proper file naming conventions', async () => {
      const codeBlocksDir = 'test-content/code-blocks';
      const languages = await fs.readdir(codeBlocksDir);
      
      for (const lang of languages) {
        if (lang.startsWith('.')) continue; // Skip hidden files
        
        const langDir = path.join(codeBlocksDir, lang);
        const stats = await fs.stat(langDir);
        
        if (stats.isDirectory()) {
          const files = await fs.readdir(langDir);
          
          for (const file of files) {
            if (file.startsWith('.')) continue; // Skip hidden files
            
            // Should have appropriate file extension
            const expectedExtensions = {
              'python': ['.py'],
              'javascript': ['.js'],
              'sql': ['.sql'],
              'bash': ['.sh'],
              'html': ['.html'],
              'css': ['.css'],
              'java': ['.java'],
              'cpp': ['.cpp', '.cc', '.cxx'],
              'go': ['.go'],
              'rust': ['.rs']
            };
            
            if (expectedExtensions[lang]) {
              const hasValidExtension = expectedExtensions[lang].some(ext => 
                file.endsWith(ext)
              );
              expect(hasValidExtension).toBe(true);
            }
            
            // Should not have spaces or special characters in filename
            expect(file).toMatch(/^[a-zA-Z0-9._-]+$/);
          }
        }
      }
    });

    it('should have non-empty content files', async () => {
      const checkDirectory = async (dirPath) => {
        try {
          const entries = await fs.readdir(dirPath, { withFileTypes: true });
          
          for (const entry of entries) {
            if (entry.name.startsWith('.')) continue; // Skip hidden files
            
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
              await checkDirectory(fullPath);
            } else if (entry.isFile()) {
              const content = await fs.readFile(fullPath, 'utf8');
              expect(content.trim().length).toBeGreaterThan(0);
            }
          }
        } catch (error) {
          // Directory might not exist, which is acceptable for some categories
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
      };

      await checkDirectory('test-content/code-blocks');
      await checkDirectory('test-content/long-responses');
      await checkDirectory('test-content/tables');
      await checkDirectory('test-content/links');
    });

    it('should have valid TOML configuration', async () => {
      const configContent = await fs.readFile('test-content/config.toml', 'utf8');
      
      // Should contain required sections
      expect(configContent).toContain('[content]');
      expect(configContent).toContain('[commands]');
      
      // Should contain content category configurations
      expect(configContent).toContain('code-blocks');
      expect(configContent).toContain('long-responses');
      expect(configContent).toContain('tables');
      expect(configContent).toContain('links');
      
      // Should contain command mappings
      expect(configContent).toContain('code_single');
      expect(configContent).toContain('code_multiple');
      expect(configContent).toContain('code_many');
      
      // Should not contain placeholder values
      expect(configContent).not.toContain('PLACEHOLDER');
      expect(configContent).not.toContain('TODO');
    });
  });

  describe('Backward Compatibility Validation', () => {
    it('should maintain content equivalence with legacy system', () => {
      // Test that the new system provides content that matches
      // the quality and variety of the old hardcoded system
      
      // Code blocks should cover major programming languages
      const languages = ['python', 'javascript', 'sql', 'java', 'html', 'css'];
      languages.forEach(lang => {
        const codeBlock = contentManager.getCodeBlock(lang);
        expect(codeBlock).toMatch(/^```\w+\n[\s\S]*\n```$/);
        expect(codeBlock).toContain('```' + lang);
      });
      
      // Long responses should be substantial
      const longResponse = contentManager.getLongResponse(3);
      const paragraphs = longResponse.split('\n\n');
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);
      expect(paragraphs.length).toBeLessThanOrEqual(3);
      
      // Tables should be properly formatted
      const table = contentManager.getMarkdownTable();
      expect(table).toMatch(/\|.*\|.*\|/);
      
      // Links should contain actual URLs
      const links = contentManager.getLinkedContent();
      expect(links).toMatch(/https?:\/\/[^\s]+|\[.*\]\(.*\)/);
    });

    it('should log guidance when filesystem content unavailable', () => {
      // Temporarily disable content loading
      const originalIsLoaded = contentManager.isLoaded;
      contentManager.isLoaded = false;

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const codeBlock = contentManager.getCodeBlock();
        const longResponse = contentManager.getLongResponse();
        const table = contentManager.getMarkdownTable();
        const links = contentManager.getLinkedContent();

        expect(codeBlock).toBe('');
        expect(longResponse).toBe('');
        expect(table).toBe('');
        expect(links).toBe('');

        const messages = errorSpy.mock.calls.map(call => call[0]);
        expect(messages.some(msg => msg.includes('code block content'))).toBe(true);
        expect(messages.some(msg => msg.includes(path.join(contentManager.contentPath, 'code-blocks')))).toBe(true);
        expect(messages.some(msg => msg.includes('long response content'))).toBe(true);
        expect(messages.some(msg => msg.includes(path.join(contentManager.contentPath, 'long-responses')))).toBe(true);
        expect(messages.some(msg => msg.includes('markdown table content'))).toBe(true);
        expect(messages.some(msg => msg.includes(path.join(contentManager.contentPath, 'tables')))).toBe(true);
        expect(messages.some(msg => msg.includes('linked content'))).toBe(true);
        expect(messages.some(msg => msg.includes(path.join(contentManager.contentPath, 'links')))).toBe(true);
      } finally {
        // Restore original state
        contentManager.isLoaded = originalIsLoaded;
        errorSpy.mockRestore();
      }
    });
  });

  describe('Performance and Scalability Validation', () => {
    it('should load content efficiently', async () => {
      const startTime = Date.now();
      
      const testContentManager = new ContentManager('./test-content');
      await testContentManager.loadContent();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000);
      
      // Should have loaded content successfully
      expect(testContentManager.isLoaded).toBe(true);
    });

    it('should handle multiple content requests efficiently', () => {
      const startTime = Date.now();
      
      // Make multiple content requests
      for (let i = 0; i < 100; i++) {
        contentManager.getCodeBlock();
        contentManager.getLongResponse();
        contentManager.getMarkdownTable();
        contentManager.getLinkedContent();
      }
      
      const requestTime = Date.now() - startTime;
      
      // Should handle 400 requests within reasonable time (1 second)
      expect(requestTime).toBeLessThan(1000);
    });

    it('should maintain consistent memory usage', () => {
      const initialStatus = contentManager.getStatus();
      
      // Make many content requests
      for (let i = 0; i < 1000; i++) {
        contentManager.getCodeBlock();
      }
      
      const finalStatus = contentManager.getStatus();
      
      // Content counts should remain stable
      expect(finalStatus.totalContent).toBe(initialStatus.totalContent);
      expect(finalStatus.isLoaded).toBe(initialStatus.isLoaded);
    });
  });
});