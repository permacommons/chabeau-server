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
      'tables': [],
      'links': {}
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
        'tables': [],
        'links': {}
      };

      // Load content for each category
      await this._loadCodeBlocks();
      await this._loadLongResponses();
      await this._loadTables();
      await this._loadLinks();

      // Check if we have any content loaded
      const totalContent = this._getTotalContentCount();
      if (totalContent === 0) {
        console.warn('No content files were loaded successfully. All responses will use fallback content.');
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
      console.warn('Content not loaded, using fallback');
      return this._getFallbackCodeBlock(language);
    }
    
    const filters = language ? { language } : {};
    const selected = this._selectRandomContent('code-blocks', 1, filters);
    
    if (selected.length === 0) {
      console.warn(`No code blocks found for language: ${language || 'any'}, using fallback`);
      return this._getFallbackCodeBlock(language);
    }
    
    const codeBlock = selected[0];
    const extension = path.extname(codeBlock.metadata.filename);
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
      console.warn('Content not loaded, using fallback');
      return this._getFallbackLongResponse(count);
    }
    
    const maxParagraphs = this.config?.content?.['long-responses']?.max_paragraphs || 6;
    const actualCount = Math.min(count, maxParagraphs);
    
    const selected = this._selectRandomContent('long-responses', actualCount);
    
    if (selected.length === 0) {
      console.warn('No long response content found, using fallback');
      return this._getFallbackLongResponse(count);
    }
    
    // Join paragraphs with double newlines
    return selected.map(item => item.content).join('\n\n');
  }

  /**
   * Get markdown table content
   * @param {number} count - Number of tables to return (default: 1)
   * @returns {string} Markdown table content
   */
  getMarkdownTable(count = 1) {
    if (!this.isLoaded) {
      console.warn('Content not loaded, using fallback');
      return this._getFallbackMarkdownTable(count);
    }
    
    const selected = this._selectRandomContent('tables', count);
    
    if (selected.length === 0) {
      console.warn('No table content found, using fallback');
      return this._getFallbackMarkdownTable(count);
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
      console.warn('Content not loaded, using fallback');
      return this._getFallbackLinkedContent(complexity);
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
      console.warn(`No link content found for complexity: ${complexityLevel}, using fallback`);
      return this._getFallbackLinkedContent(complexity);
    }
    
    return selected[0].content;
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
      // For long-responses and tables, just use the array directly
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
   * Get fallback code block when filesystem content is unavailable
   * @private
   * @param {string|null} language - Programming language
   * @returns {string} Fallback code block
   */
  _getFallbackCodeBlock(language = null) {
    const fallbackCode = {
      python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Example usage
print(fibonacci(10))`,
      javascript: `function fetchData(url) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}`,
      sql: `SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2023-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC;`
    };

    const code = fallbackCode[language] || fallbackCode.javascript;
    const lang = language || 'javascript';
    
    return `\`\`\`${lang}\n${code}\n\`\`\``;
  }

  /**
   * Get fallback long response when filesystem content is unavailable
   * @private
   * @param {number} count - Number of paragraphs
   * @returns {string} Fallback long response
   */
  _getFallbackLongResponse(count = 1) {
    const fallbackParagraphs = [
      "In the realm of digital communication, we find ourselves at the intersection of human creativity and artificial intelligence. This convergence creates fascinating opportunities for meaningful dialogue and collaborative problem-solving.",
      
      "The evolution of conversational AI represents a significant milestone in our technological journey. As these systems become more sophisticated, they begin to mirror the nuanced patterns of human communication while maintaining their unique computational advantages.",
      
      "Consider the implications of seamless human-AI interaction in various domains. From creative writing assistance to complex data analysis, these partnerships are reshaping how we approach intellectual challenges and creative endeavors.",
      
      "The future of AI communication lies not in replacing human interaction, but in augmenting our capabilities. By understanding context, emotion, and intent, AI systems can provide more personalized and effective assistance across diverse applications.",
      
      "As we continue to refine these technologies, we must remain mindful of the ethical considerations and societal impacts. The goal is to create AI that enhances human potential while preserving the authenticity and depth of genuine human connection.",
      
      "The journey toward more natural AI communication is ongoing, with each interaction providing valuable insights into the complexities of language, understanding, and meaningful exchange between humans and artificial intelligence."
    ];

    const actualCount = Math.min(count, fallbackParagraphs.length);
    return fallbackParagraphs.slice(0, actualCount).join('\n\n');
  }

  /**
   * Get fallback markdown table when filesystem content is unavailable
   * @private
   * @param {number} count - Number of tables
   * @returns {string} Fallback markdown table
   */
  _getFallbackMarkdownTable(count = 1) {
    const fallbackTables = [
      `| Feature | Status | Priority |
|---------|--------|----------|
| User Authentication | Complete | High |
| Data Validation | In Progress | High |
| API Documentation | Pending | Medium |
| Performance Testing | Not Started | Low |`,

      `| Language | Popularity | Use Case |
|----------|------------|----------|
| JavaScript | Very High | Web Development |
| Python | High | Data Science |
| Java | High | Enterprise |
| Go | Medium | Backend Services |`,

      `| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Response Time | 120ms | 100ms | ⚠️ |
| Uptime | 99.9% | 99.95% | ✅ |
| Error Rate | 0.1% | 0.05% | ⚠️ |
| Throughput | 1000 RPS | 1200 RPS | ⚠️ |`
    ];

    const actualCount = Math.min(count, fallbackTables.length);
    return fallbackTables.slice(0, actualCount).join('\n\n');
  }

  /**
   * Get fallback linked content when filesystem content is unavailable
   * @private
   * @param {number} complexity - Complexity level
   * @returns {string} Fallback linked content
   */
  _getFallbackLinkedContent(complexity = 1) {
    const fallbackContent = {
      1: `Check out these useful resources:
- Documentation: https://docs.example.com
- GitHub Repository: https://github.com/example/project
- Community Forum: https://forum.example.com`,

      2: `For comprehensive learning, explore these [documentation resources](https://docs.example.com) and join our [community discussions](https://forum.example.com). 

You can also contribute to the [open source project](https://github.com/example/project) or read our [technical blog](https://blog.example.com) for the latest updates.`,

      3: `| Resource Type | Link | Description |
|---------------|------|-------------|
| Documentation | [Official Docs](https://docs.example.com) | Complete API reference |
| Repository | [GitHub](https://github.com/example/project) | Source code and issues |
| Community | [Forum](https://forum.example.com) | User discussions |
| Blog | [Tech Blog](https://blog.example.com) | Latest updates |`
    };

    return fallbackContent[complexity] || fallbackContent[1];
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
    
    // Count links
    for (const complexity in this.contentRegistry['links']) {
      total += this.contentRegistry['links'][complexity].length;
    }
    
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
        tables: this.contentRegistry['tables'].length,
        links: {
          total: Object.values(this.contentRegistry['links']).reduce((sum, arr) => sum + arr.length, 0),
          complexityLevels: linkComplexityLevels
        }
      },
      errors: this.loadErrors,
      configPath: this.configLoader.configPath,
      contentPath: this.contentPath
    };
  }
}

export default ContentManager;