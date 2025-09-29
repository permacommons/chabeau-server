# Content Management Guide

This guide explains how to manage test content in the ELIZA chatbot server's filesystem-based content system.

## Overview

The content management system allows server developers to add new test content by simply adding files to organized directories. The system automatically discovers and loads content without requiring code changes or server restarts.

## Directory Structure

```
test-content/
├── config.toml                 # Configuration file
├── code-blocks/                # Programming examples
│   ├── python/                 # *.py files
│   ├── javascript/             # *.js files  
│   ├── sql/                    # *.sql files
│   ├── bash/                   # *.sh files
│   ├── html/                   # *.html files
│   ├── css/                    # *.css files
│   ├── java/                   # *.java files
│   ├── cpp/                    # *.cpp files
│   ├── go/                     # *.go files
│   └── rust/                   # *.rs files
├── long-responses/             # *.txt files
├── tables/                     # *.md files
└── links/                      # *.txt, *.md files
```

## Adding New Content

### Code Blocks

Add programming examples to language-specific directories under `test-content/code-blocks/`.

**File Requirements:**
- Use proper file extensions (`.py`, `.js`, `.sql`, etc.)
- Include complete, runnable code examples
- Add brief comments explaining the code purpose
- Keep examples focused on single concepts

**Example - Adding a Python file:**

```bash
# Create: test-content/code-blocks/python/data-processing.py
```

```python
# Data processing with pandas
import pandas as pd

def process_sales_data(filename):
    """Process sales data and return summary statistics."""
    df = pd.read_csv(filename)
    
    # Clean and transform data
    df['date'] = pd.to_datetime(df['date'])
    df['revenue'] = df['quantity'] * df['price']
    
    # Generate summary
    summary = {
        'total_revenue': df['revenue'].sum(),
        'avg_order_value': df['revenue'].mean(),
        'top_product': df.groupby('product')['revenue'].sum().idxmax()
    }
    
    return summary

# Usage example
if __name__ == "__main__":
    results = process_sales_data('sales.csv')
    print(f"Total Revenue: ${results['total_revenue']:,.2f}")
```

### Long Responses

Add paragraph content to `test-content/long-responses/` as `.txt` files.

**File Requirements:**
- 80-120 words per file
- Single coherent paragraph
- Descriptive filename
- Engaging, conversational content

**Example - Adding a response file:**

```bash
# Create: test-content/long-responses/technology-philosophy.txt
```

```
The relationship between humans and technology has always been one of mutual transformation. As we shape our tools, they inevitably shape us in return, creating feedback loops that define entire civilizations. Consider how the printing press didn't just make books cheaper—it fundamentally altered how we think about knowledge, authority, and individual expression. Today's digital revolution follows similar patterns, but at unprecedented speed and scale. We're not just users of technology; we're co-evolving with it, creating new forms of intelligence, communication, and understanding that would have been unimaginable just decades ago.
```

### Markdown Tables

Add table examples to `test-content/tables/` as `.md` files.

**File Requirements:**
- Complete markdown table with headers
- Varied content demonstrating different features
- Proper markdown formatting
- Realistic data examples

**Example - Adding a table file:**

```bash
# Create: test-content/tables/database-performance.md
```

```markdown
| Database | Query Type | Avg Response Time | Throughput (req/sec) | Memory Usage |
|----------|------------|-------------------|---------------------|--------------|
| PostgreSQL | SELECT | 2.3ms | 15,420 | 256MB |
| MySQL | SELECT | 1.8ms | 18,750 | 198MB |
| MongoDB | FIND | 3.1ms | 12,300 | 312MB |
| Redis | GET | 0.1ms | 89,500 | 64MB |
| Elasticsearch | SEARCH | 45ms | 2,100 | 1.2GB |
| SQLite | SELECT | 0.8ms | 8,900 | 32MB |
```

### Link Content

Add content with embedded links to `test-content/links/`.

**File Requirements:**
- Mix of plain URLs and markdown links
- Contextual, engaging content
- Various complexity levels
- Support for `.txt` and `.md` formats

**Example - Adding a links file:**

```bash
# Create: test-content/links/web-history.md
```

```markdown
The evolution of the web represents one of humanity's greatest collaborative achievements. Tim Berners-Lee's original vision at https://www.w3.org/History/1989/proposal.html laid the foundation for what would become the World Wide Web. 

The early days were marked by simple HTML pages, but visionaries like [Ted Nelson](https://en.wikipedia.org/wiki/Ted_Nelson) had already imagined hypertext systems decades earlier. His Xanadu project, while never fully realized, influenced countless developers and thinkers.

Today's web bears little resemblance to those early static pages. Modern frameworks, APIs, and interactive applications have created an ecosystem that would astound the pioneers. Yet the fundamental principles—open standards, universal access, and interconnected information—remain as relevant as ever.
```

## Configuration Options

The `test-content/config.toml` file controls system behavior:

```toml
[content]
# Enable/disable content categories
[content.code-blocks]
enabled = true
languages = ["python", "javascript", "sql", "bash", "html", "css", "java", "cpp", "go", "rust"]

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
# Command pattern mappings (customize if needed)
code_single = "@"
code_multiple = "@@"
code_many = "@@@"
response_short = "!"
response_medium = "!!"
response_long = "!!!"
table_single = "|"
table_multiple = "||"
table_many = "|||"
link_simple = "%"
link_complex = "%%"
link_advanced = "%%%"
```

### Configuration Effects

**Disabling Categories:**
```toml
[content.code-blocks]
enabled = false  # Disables all code block generation
```

**Limiting Languages:**
```toml
[content.code-blocks]
languages = ["python", "javascript"]  # Only these languages will be used
```

**Custom Commands:**
```toml
[commands]
code_single = "#"  # Changes @ command to # command
```

## File Naming Conventions

### Code Blocks
- Use descriptive names: `fibonacci.py`, `async-fetch.js`, `user-authentication.sql`
- Avoid spaces: use hyphens or underscores
- Include the purpose: `thread-safe-queue.cpp`, `responsive-grid.html`

### Long Responses  
- Describe the topic: `ai-consciousness.txt`, `digital-archaeology.txt`
- Use hyphens for multi-word topics
- Keep names concise but descriptive

### Tables
- Indicate the data type: `performance-metrics.md`, `api-endpoints.md`
- Use plural forms when appropriate
- Describe the table's purpose clearly

### Links
- Indicate complexity: `simple-links.txt`, `complex-links.md`
- Describe the content theme: `web-history.md`, `technology-trends.txt`

## Troubleshooting

### Common Issues

**Content Not Loading**
- Check file permissions (files must be readable)
- Verify file extensions match expected formats
- Ensure files contain valid content (not empty)
- Check directory structure matches expected layout

**Configuration Errors**
- Validate TOML syntax using an online validator
- Ensure all required sections are present
- Check that language names match directory names
- Verify command patterns don't conflict

**Missing Content Categories**
- Ensure directories exist under `test-content/`
- Add at least one file to each category directory
- Check that category is enabled in `config.toml`
- Verify file formats match category requirements

**Performance Issues**
- Large numbers of files (>1000 per category) may slow startup
- Consider organizing large collections into subdirectories
- Monitor memory usage with extensive content libraries
- Use appropriate file sizes (avoid extremely large files)

### Error Messages

**"Content directory not found"**
- Create the missing directory under `test-content/`
- Ensure proper spelling and case sensitivity

**"No content files found in category"**
- Add at least one properly formatted file to the directory
- Check file extensions match category requirements

**"Invalid TOML configuration"**
- Use a TOML validator to check syntax
- Common issues: missing quotes, incorrect indentation, invalid characters

**"Content file unreadable"**
- Check file permissions
- Ensure file is not corrupted or binary
- Verify file encoding (should be UTF-8)

### Debugging Tips

1. **Check Server Logs:** Error messages provide specific file paths and issues
2. **Test Configuration:** Use a TOML validator before restarting the server
3. **Verify File Structure:** Ensure directories and files match expected layout
4. **Start Small:** Add one file at a time to identify problematic content
5. **Use Fallbacks:** The system falls back to default content when files are unavailable

## Best Practices

### Content Quality
- Write clear, well-commented code examples
- Use realistic data in tables and examples
- Ensure content is appropriate for testing purposes
- Keep examples focused and educational

### Organization
- Group related content logically
- Use consistent naming patterns
- Maintain reasonable file sizes
- Document complex examples with comments

### Maintenance
- Regularly review and update content
- Remove outdated or broken examples
- Test new content before adding to production
- Keep configuration simple and well-documented

### Performance
- Avoid extremely large files (>100KB)
- Limit total files per category to reasonable numbers
- Use efficient file formats (plain text when possible)
- Monitor system resource usage with large content sets