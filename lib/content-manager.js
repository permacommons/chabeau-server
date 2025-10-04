import fs from 'fs/promises';
import path from 'path';
import ConfigLoader from './config-loader.js';

/**
 * ContentManager class for managing test content in the ELIZA chatbot server
 * Provides filesystem-based content organization with TOML configuration
 */
class ContentManager {
  constructor(contentPath = './test-content') {
    this.contentPath = contentPath;
    this.configLoader = new ConfigLoader(path.join(contentPath, 'config.toml'));
    this.config = null;
    this.contentRegistry = {
      'code-blocks': {},
      'long-responses': [],
      'rich-markdown': [],
      'tables': [],
      'links': {},
      'terminal-breaking-emoji': [],
      'international-text': []
    };
    this.isLoaded = false;
    this.loadErrors = [];
  }

  /**
   * Load all content from filesystem and configuration
   * @returns {Promise<void>}
   */
  async loadContent() {
    try {
      // Clear previous errors
      this.loadErrors = [];
      
      // Load configuration first
      this.config = await this._loadConfig();
      
      // Initialize content registry
      this.contentRegistry = {
        'code-blocks': {},
        'long-responses': [],
        'rich-markdown': [],
        'tables': [],
        'links': {},
        'terminal-breaking-emoji': [],
        'international-text': []
      };

      // Load content for each category
      await this._loadCodeBlocks();
      await this._loadLongResponses();
      await this._loadTables();
      await this._loadRichMarkdown();
      await this._loadLinks();
      await this._loadTerminalBreakingEmoji();
      await this._loadInternationalText();

      // Check if we have any content loaded
      const totalContent = this._getTotalContentCount();
      if (totalContent === 0) {
        console.warn('No content files were loaded successfully. Commands requiring external content will return empty output until files are provided.');
        this.isLoaded = false;
      } else {
        this.isLoaded = true;
        console.log(`Content loading completed successfully. Loaded ${totalContent} content items.`);
      }
      
      // Log any errors that occurred during loading
      if (this.loadErrors.length > 0) {
        console.warn(`${this.loadErrors.length} errors occurred during content loading:`);
        this.loadErrors.forEach(error => console.warn(`  - ${error}`));
      }
      
    } catch (error) {
      console.error('Critical error during content loading:', error.message);
      this.loadErrors.push(`Critical error: ${error.message}`);
      this.isLoaded = false;
    }
  }

  /**
   * Get a random code block, optionally filtered by language
   * @param {string|null} language - Programming language filter (optional)
   * @returns {string} Code block content
   */
  getCodeBlock(language = null) {
    if (!this.isLoaded) {
      this._logMissingContent('code-blocks', { language, reason: 'notLoaded' });
      return '';
    }

    const filters = language ? { language } : {};
    const selected = this._selectRandomContent('code-blocks', 1, filters);

    if (selected.length === 0) {
      this._logMissingContent('code-blocks', { language, reason: 'missingSelection' });
      return '';
    }

    const codeBlock = selected[0];
    const languageFromFile = codeBlock.subcategory;

    // Format as markdown code block
    return `\`\`\`${languageFromFile}\n${codeBlock.content}\n\`\`\``;
  }

  /**
   * Get long response paragraphs
   * @param {number} count - Number of paragraphs to return (default: 1)
   * @returns {string} Long response content
   */
  getLongResponse(count = 1) {
    if (!this.isLoaded) {
      this._logMissingContent('long-responses', { reason: 'notLoaded' });
      return '';
    }

    const maxParagraphs = this.config?.content?.['long-responses']?.max_paragraphs || 6;
    const actualCount = Math.min(count, maxParagraphs);

    const selected = this._selectRandomContent('long-responses', actualCount);

    if (selected.length === 0) {
      this._logMissingContent('long-responses', { reason: 'missingSelection' });
      return '';
    }

    // Join paragraphs with double newlines
    return selected.map(item => item.content).join('\n\n');
  }

  /**
   * Get rich markdown paragraphs
   * @param {number} count - Number of paragraphs to return (default: 1)
   * @returns {string} Rich markdown content
   */
  getRichMarkdown(count = 1) {
    if (!this.isLoaded) {
      this._logMissingContent('rich-markdown', { reason: 'notLoaded' });
      return '';
    }

    const maxParagraphs = this.config?.content?.['rich-markdown']?.max_paragraphs || 6;
    const actualCount = Math.min(count, maxParagraphs);

    const selected = this._selectRandomContent('rich-markdown', actualCount);

    if (selected.length === 0) {
      this._logMissingContent('rich-markdown', { reason: 'missingSelection' });
      return '';
    }

    return selected.map(item => item.content).join('\n\n');
  }

  /**
   * Get markdown table content
   * @param {number} count - Number of tables to return (default: 1)
   * @returns {string} Markdown table content
   */
  getMarkdownTable(count = 1) {
    if (!this.isLoaded) {
      this._logMissingContent('tables', { reason: 'notLoaded' });
      return '';
    }

    const selected = this._selectRandomContent('tables', count);

    if (selected.length === 0) {
      this._logMissingContent('tables', { reason: 'missingSelection' });
      return '';
    }

    // Join tables with double newlines if multiple
    return selected.map(item => item.content).join('\n\n');
  }

  /**
   * Get content with embedded links
   * @param {number} complexity - Complexity level (1=simple, 2=complex, 3=advanced)
   * @returns {string} Content with links
   */
  getLinkedContent(complexity = 1) {
    if (!this.isLoaded) {
      this._logMissingContent('links', { reason: 'notLoaded', complexity });
      return '';
    }

    // Map complexity number to string
    const complexityMap = {
      1: 'simple',
      2: 'complex',
      3: 'table-embedded'
    };
    
    const complexityLevel = complexityMap[complexity] || 'simple';
    const filters = { complexity: complexityLevel };
    
    const selected = this._selectRandomContent('links', 1, filters);
    
    if (selected.length === 0) {
      this._logMissingContent('links', { reason: 'missingSelection', complexity, complexityLevel });
      return '';
    }

    return selected[0].content;
  }

  /**
   * Get terminal-breaking emoji content
   * @param {number} count - Number of items to return (default: 1)
   * @returns {string} Terminal-breaking emoji content
   */
  getTerminalBreakingEmoji(count = 1) {
    if (!this.isLoaded) {
      this._logMissingContent('terminal-breaking-emoji', { reason: 'notLoaded' });
      return '';
    }

    const selected = this._selectRandomContent('terminal-breaking-emoji', count);

    if (selected.length === 0) {
      this._logMissingContent('terminal-breaking-emoji', { reason: 'missingSelection' });
      return '';
    }

    return selected.map(item => item.content).join('\n\n');
  }

  /**
   * Get international text content
   * @param {number} count - Number of items to return (default: 1)
   * @returns {string} International text content
   */
  getInternationalText(count = 1) {
    if (!this.isLoaded) {
      this._logMissingContent('international-text', { reason: 'notLoaded' });
      return '';
    }

    const selected = this._selectRandomContent('international-text', count);

    if (selected.length === 0) {
      this._logMissingContent('international-text', { reason: 'missingSelection' });
      return '';
    }

    return selected.map(item => item.content).join('\n\n');
  }

  /**
   * Load TOML configuration
   * @private
   * @returns {Promise<Object>} Configuration object
   */
  async _loadConfig() {
    return await this.configLoader.loadConfig();
  }

  /**
   * Scan directory for content files
   * @private
   * @param {string} dirPath - Directory path to scan
   * @param {string} category - Content category
   * @returns {Promise<Array>} Array of content items
   */
  async _scanDirectory(dirPath, category) {
    const contentItems = [];
    
    try {
      // Check if directory exists
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        console.warn(`Path is not a directory: ${dirPath}`);
        return contentItems;
      }

      // Read directory contents
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // For code-blocks and links, scan subdirectories
          if (category === 'code-blocks' || category === 'links') {
            const subItems = await this._scanDirectory(fullPath, category);
            contentItems.push(...subItems);
          }
        } else if (entry.isFile()) {
          // Skip hidden files and non-content files
          if (entry.name.startsWith('.') || entry.name.startsWith('~')) {
            continue;
          }
          
          try {
            const contentItem = await this._readContentFile(fullPath);
            if (contentItem) {
              contentItems.push(contentItem);
            }
          } catch (error) {
            console.warn(`Failed to read content file ${fullPath}:`, error.message);
          }
        }
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`Directory not found: ${dirPath}`);
      } else {
        console.error(`Error scanning directory ${dirPath}:`, error.message);
      }
    }
    
    return contentItems;
  }

  /**
   * Read and validate content file
   * @private
   * @param {string} filePath - Path to content file
   * @returns {Promise<Object>} Content item object
   */
  async _readContentFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Basic validation - ensure content is not empty
      if (!content.trim()) {
        console.warn(`Empty content file: ${filePath}`);
        return null;
      }
      
      // Parse file path to determine category and subcategory
      const relativePath = path.relative(this.contentPath, filePath);
      const pathParts = relativePath.split(path.sep);
      
      let category, subcategory;
      if (pathParts[0] === 'code-blocks') {
        category = 'code-blocks';
        subcategory = pathParts[1] || 'unknown';
      } else if (pathParts[0] === 'long-responses') {
        category = 'long-responses';
        subcategory = null;
      } else if (pathParts[0] === 'tables') {
        category = 'tables';
        subcategory = null;
      } else if (pathParts[0] === 'rich-markdown') {
        category = 'rich-markdown';
        subcategory = null;
      } else if (pathParts[0] === 'links') {
        category = 'links';
        // Determine complexity based on filename or directory
        if (filePath.includes('simple')) {
          subcategory = 'simple';
        } else if (filePath.includes('complex')) {
          subcategory = 'complex';
        } else if (filePath.includes('table')) {
          subcategory = 'table-embedded';
        } else {
          subcategory = 'simple'; // default
        }
      } else if (pathParts[0] === 'terminal-breaking-emoji') {
        category = 'terminal-breaking-emoji';
        subcategory = null;
      } else if (pathParts[0] === 'international-text') {
        category = 'international-text';
        subcategory = null;
      } else {
        console.warn(`Unknown content category for file: ${filePath}`);
        return null;
      }
      
      return {
        category,
        subcategory,
        content: content.trim(),
        metadata: {
          filename: path.basename(filePath),
          path: filePath,
          relativePath,
          size: stats.size,
          modified: stats.mtime
        }
      };
      
    } catch (error) {
      console.error(`Error reading content file ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Select random content from category
   * @private
   * @param {string} category - Content category
   * @param {number} count - Number of items to select
   * @param {Object} filters - Optional filters
   * @returns {Array} Selected content items
   */
  _selectRandomContent(category, count = 1, filters = {}) {
    let availableItems = [];
    
    if (category === 'code-blocks') {
      if (filters.language) {
        // Filter by specific language
        availableItems = this.contentRegistry['code-blocks'][filters.language] || [];
      } else {
        // Get all code blocks from all languages
        for (const language in this.contentRegistry['code-blocks']) {
          availableItems.push(...this.contentRegistry['code-blocks'][language]);
        }
      }
    } else if (category === 'links') {
      if (filters.complexity) {
        // Filter by complexity level
        availableItems = this.contentRegistry['links'][filters.complexity] || [];
      } else {
        // Get all links from all complexity levels
        for (const complexity in this.contentRegistry['links']) {
          availableItems.push(...this.contentRegistry['links'][complexity]);
        }
      }
    } else {
      // For long-responses, tables, and rich-markdown, just use the array directly
      availableItems = this.contentRegistry[category] || [];
    }
    
    if (availableItems.length === 0) {
      return [];
    }
    
    // Randomly select items
    const selected = [];
    const actualCount = Math.min(count, availableItems.length);
    
    if (actualCount === availableItems.length) {
      // If we need all items, just return them all
      return [...availableItems];
    }
    
    // Use Fisher-Yates shuffle to get random selection
    const shuffled = [...availableItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, actualCount);
  }

  /**
   * Load code block content from filesystem
   * @private
   */
  async _loadCodeBlocks() {
    try {
      const codeBlocksPath = path.join(this.contentPath, 'code-blocks');
      const contentItems = await this._scanDirectory(codeBlocksPath, 'code-blocks');
      
      // Organize by language (subcategory)
      for (const item of contentItems) {
        if (!this.contentRegistry['code-blocks'][item.subcategory]) {
          this.contentRegistry['code-blocks'][item.subcategory] = [];
        }
        this.contentRegistry['code-blocks'][item.subcategory].push(item);
      }
      
      const languageCount = Object.keys(this.contentRegistry['code-blocks']).length;
      console.log(`Loaded ${contentItems.length} code block files across ${languageCount} languages`);
      
      if (contentItems.length === 0) {
        this.loadErrors.push('No code block files found');
      }
    } catch (error) {
      const errorMsg = `Failed to load code blocks: ${error.message}`;
      console.error(errorMsg);
      this.loadErrors.push(errorMsg);
    }
  }

  /**
   * Load long response content from filesystem
   * @private
   */
  async _loadLongResponses() {
    try {
      const longResponsesPath = path.join(this.contentPath, 'long-responses');
      const contentItems = await this._scanDirectory(longResponsesPath, 'long-responses');

      this.contentRegistry['long-responses'] = contentItems;
      console.log(`Loaded ${contentItems.length} long response files`);

      if (contentItems.length === 0) {
        this.loadErrors.push('No long response files found');
      }
    } catch (error) {
      const errorMsg = `Failed to load long responses: ${error.message}`;
      console.error(errorMsg);
      this.loadErrors.push(errorMsg);
    }
  }

  /**
   * Load rich markdown content from filesystem
   * @private
   */
  async _loadRichMarkdown() {
    try {
      const richMarkdownPath = path.join(this.contentPath, 'rich-markdown');
      const contentItems = await this._scanDirectory(richMarkdownPath, 'rich-markdown');

      this.contentRegistry['rich-markdown'] = contentItems;
      console.log(`Loaded ${contentItems.length} rich markdown files`);

      if (contentItems.length === 0) {
        this.loadErrors.push('No rich markdown files found');
      }
    } catch (error) {
      const errorMsg = `Failed to load rich markdown: ${error.message}`;
      console.error(errorMsg);
      this.loadErrors.push(errorMsg);
    }
  }

  /**
   * Load table content from filesystem
   * @private
   */
  async _loadTables() {
    try {
      const tablesPath = path.join(this.contentPath, 'tables');
      const contentItems = await this._scanDirectory(tablesPath, 'tables');
      
      this.contentRegistry['tables'] = contentItems;
      console.log(`Loaded ${contentItems.length} table files`);
      
      if (contentItems.length === 0) {
        this.loadErrors.push('No table files found');
      }
    } catch (error) {
      const errorMsg = `Failed to load tables: ${error.message}`;
      console.error(errorMsg);
      this.loadErrors.push(errorMsg);
    }
  }

  /**
   * Load link content from filesystem
   * @private
   */
  async _loadLinks() {
    try {
      const linksPath = path.join(this.contentPath, 'links');
      const contentItems = await this._scanDirectory(linksPath, 'links');
      
      // Organize by complexity level (subcategory)
      for (const item of contentItems) {
        if (!this.contentRegistry['links'][item.subcategory]) {
          this.contentRegistry['links'][item.subcategory] = [];
        }
        this.contentRegistry['links'][item.subcategory].push(item);
      }
      
      const complexityCount = Object.keys(this.contentRegistry['links']).length;
      console.log(`Loaded ${contentItems.length} link files across ${complexityCount} complexity levels`);
      
      if (contentItems.length === 0) {
        this.loadErrors.push('No link files found');
      }
    } catch (error) {
      const errorMsg = `Failed to load links: ${error.message}`;
      console.error(errorMsg);
      this.loadErrors.push(errorMsg);
    }
  }

  /**
   * Load terminal-breaking emoji content from filesystem
   * @private
   */
  async _loadTerminalBreakingEmoji() {
    try {
      const terminalBreakingEmojiPath = path.join(this.contentPath, 'terminal-breaking-emoji');
      const contentItems = await this._scanDirectory(terminalBreakingEmojiPath, 'terminal-breaking-emoji');

      this.contentRegistry['terminal-breaking-emoji'] = contentItems;
      console.log(`Loaded ${contentItems.length} terminal-breaking emoji files`);

      if (contentItems.length === 0) {
        this.loadErrors.push('No terminal-breaking emoji files found');
      }
    } catch (error) {
      const errorMsg = `Failed to load terminal-breaking emoji: ${error.message}`;
      console.error(errorMsg);
      this.loadErrors.push(errorMsg);
    }
  }

  /**
   * Load international text content from filesystem
   * @private
   */
  async _loadInternationalText() {
    try {
      const internationalTextPath = path.join(this.contentPath, 'international-text');
      const contentItems = await this._scanDirectory(internationalTextPath, 'international-text');

      this.contentRegistry['international-text'] = contentItems;
      console.log(`Loaded ${contentItems.length} international text files`);

      if (contentItems.length === 0) {
        this.loadErrors.push('No international text files found');
      }
    } catch (error) {
      const errorMsg = `Failed to load international text: ${error.message}`;
      console.error(errorMsg);
      this.loadErrors.push(errorMsg);
    }
  }

  /**
   * Get total count of loaded content items
   * @private
   * @returns {number} Total content count
   */
  _logMissingContent(category, context = {}) {
    const basePath = path.join(this.contentPath, category);
    let targetPath = basePath;
    let description;

    switch (category) {
      case 'code-blocks': {
        const languageSegment = context.language || '<language>';
        targetPath = path.join(basePath, languageSegment);
        description = context.language
          ? `code block content for language "${context.language}"`
          : 'code block content';
        break;
      }
      case 'long-responses':
        description = 'long response content';
        break;
      case 'rich-markdown':
        description = 'rich markdown content';
        break;
      case 'tables':
        description = 'markdown table content';
        break;
      case 'links': {
        const complexitySegment = context.complexityLevel || '<complexity>';
        targetPath = path.join(basePath, complexitySegment);
        description = context.complexityLevel
          ? `linked content at complexity "${context.complexityLevel}"`
          : 'linked content';
        break;
      }
      case 'terminal-breaking-emoji':
        description = 'terminal-breaking emoji content';
        break;
      case 'international-text':
        description = 'international text content';
        break;
      default:
        description = 'content';
        break;
    }

    const reason = context.reason === 'notLoaded'
      ? `Content for ${description} is unavailable because the registry has not been loaded.`
      : `Content for ${description} could not be found.`;

    console.error(`[ContentManager] ${reason} Place files under ${targetPath} and reload the server after adding them.`);
  }

  /**
   * Get total count of loaded content items
   * @private
   * @returns {number} Total content count
   */
  _getTotalContentCount() {
    let total = 0;
    
    // Count code blocks
    for (const language in this.contentRegistry['code-blocks']) {
      total += this.contentRegistry['code-blocks'][language].length;
    }
    
    // Count long responses
    total += this.contentRegistry['long-responses'].length;
    
    // Count tables
    total += this.contentRegistry['tables'].length;

    // Count rich markdown
    total += this.contentRegistry['rich-markdown'].length;
    
    // Count links
    for (const complexity in this.contentRegistry['links']) {
      total += this.contentRegistry['links'][complexity].length;
    }
    
    // Count terminal-breaking emoji
    total += this.contentRegistry['terminal-breaking-emoji'].length;
    
    // Count international text
    total += this.contentRegistry['international-text'].length;
    
    return total;
  }

  /**
   * Get loading status and statistics
   * @returns {Object} Status information
   */
  getStatus() {
    const totalContent = this._getTotalContentCount();
    const codeBlockLanguages = Object.keys(this.contentRegistry['code-blocks']).length;
    const linkComplexityLevels = Object.keys(this.contentRegistry['links']).length;
    
    return {
      isLoaded: this.isLoaded,
      totalContent,
      contentBreakdown: {
        codeBlocks: {
          total: Object.values(this.contentRegistry['code-blocks']).reduce((sum, arr) => sum + arr.length, 0),
          languages: codeBlockLanguages
        },
        longResponses: this.contentRegistry['long-responses'].length,
        richMarkdown: this.contentRegistry['rich-markdown'].length,
        tables: this.contentRegistry['tables'].length,
        links: {
          total: Object.values(this.contentRegistry['links']).reduce((sum, arr) => sum + arr.length, 0),
          complexityLevels: linkComplexityLevels
        },
        terminalBreakingEmoji: this.contentRegistry['terminal-breaking-emoji'].length,
        internationalText: this.contentRegistry['international-text'].length
      },
      errors: this.loadErrors,
      configPath: this.configLoader.configPath,
      contentPath: this.contentPath
    };
  }
}

export default ContentManager;