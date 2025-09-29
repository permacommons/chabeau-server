import fs from 'fs/promises';
import path from 'path';
import TOML from 'smol-toml';

/**
 * Configuration loader for ELIZA test content system
 * Handles loading and parsing TOML configuration files with fallback support
 */
class ConfigLoader {
  constructor(configPath = './test-content/config.toml') {
    this.configPath = configPath;
    this.config = null;
  }

  /**
   * Load configuration from TOML file with error handling and fallback
   * @returns {Promise<Object>} Parsed configuration object
   */
  async loadConfig() {
    try {
      // Try to read the configuration file
      const configContent = await fs.readFile(this.configPath, 'utf8');
      
      // Parse TOML content
      this.config = TOML.parse(configContent);
      
      // Validate required sections exist
      this._validateConfig();
      
      console.log(`Configuration loaded successfully from ${this.configPath}`);
      return this.config;
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`Configuration file not found at ${this.configPath}, using default configuration`);
      } else if (error.name === 'SyntaxError' || error.message.includes('TOML')) {
        console.error(`Invalid TOML syntax in ${this.configPath}:`, error.message);
      } else {
        console.error(`Error loading configuration from ${this.configPath}:`, error.message);
      }
      
      // Fall back to default configuration
      this.config = this._getDefaultConfig();
      console.log('Using default configuration');
      return this.config;
    }
  }

  /**
   * Get the current configuration (load if not already loaded)
   * @returns {Promise<Object>} Configuration object
   */
  async getConfig() {
    if (!this.config) {
      await this.loadConfig();
    }
    return this.config;
  }

  /**
   * Validate that required configuration sections exist
   * @private
   */
  _validateConfig() {
    const requiredSections = ['content', 'commands'];
    
    for (const section of requiredSections) {
      if (!this.config[section]) {
        throw new Error(`Missing required configuration section: ${section}`);
      }
    }

    // Validate content subsections
    const requiredContentSections = ['code-blocks', 'long-responses', 'tables', 'links'];
    for (const section of requiredContentSections) {
      if (!this.config.content[section]) {
        console.warn(`Missing content section: ${section}, using defaults`);
      }
    }

    // Validate command mappings
    const requiredCommands = [
      'code_single', 'code_multiple', 'code_many',
      'response_short', 'response_medium', 'response_long',
      'table_single', 'table_multiple', 'table_many',
      'link_simple', 'link_complex', 'link_advanced'
    ];
    
    for (const command of requiredCommands) {
      if (!this.config.commands[command]) {
        console.warn(`Missing command mapping: ${command}, using default`);
      }
    }
  }

  /**
   * Get default configuration as fallback
   * @private
   * @returns {Object} Default configuration object
   */
  _getDefaultConfig() {
    return {
      content: {
        'code-blocks': {
          enabled: true,
          languages: ['python', 'javascript', 'sql', 'bash', 'html', 'css', 'java', 'cpp', 'go', 'rust']
        },
        'long-responses': {
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
        code_many: '@@@',
        response_short: '!',
        response_medium: '!!',
        response_long: '!!!',
        table_single: '|',
        table_multiple: '||',
        table_many: '|||',
        link_simple: '%',
        link_complex: '%%',
        link_advanced: '%%%'
      },
      settings: {
        hot_reload: false,
        cache_content: true,
        fallback_enabled: true,
        log_level: 'info'
      }
    };
  }
}

export default ConfigLoader;