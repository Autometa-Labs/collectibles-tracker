const Anthropic = require('@anthropic-ai/sdk');
const { ReviewPrompts } = require('../templates/review-prompts');

class ClaudeClient {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    this.model = 'claude-sonnet-4-20250514'; // Specific model as requested
    this.maxTokens = 4000;
    this.temperature = 0.1; // Low temperature for consistent, focused reviews
    
    this.prompts = new ReviewPrompts();
  }

  async reviewCode(file) {
    try {
      if (!file.content || file.content.trim().length === 0) {
        console.log(`⏭️  Skipping ${file.filename} - no content to review`);
        return null;
      }

      // Determine file type and get appropriate prompt
      const fileType = this.getFileType(file.filename);
      const prompt = this.prompts.getReviewPrompt(fileType, file);

      console.log(`🧠 Sending ${file.filename} to Claude (${this.model})...`);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      if (!response.content || response.content.length === 0) {
        console.log(`⚠️  No response from Claude for ${file.filename}`);
        return null;
      }

      const reviewText = response.content[0].text;
      return this.parseReview(reviewText, file.filename);

    } catch (error) {
      console.error(`❌ Claude API error for ${file.filename}:`, error.message);
      
      // Handle rate limiting
      if (error.status === 429) {
        console.log('⏳ Rate limited, waiting 60 seconds...');
        await this.sleep(60000);
        return this.reviewCode(file); // Retry
      }
      
      throw error;
    }
  }

  getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const typeMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'dockerfile': 'docker',
      'md': 'markdown',
      'tf': 'terraform',
      'hcl': 'terraform'
    };

    // Special cases
    if (filename.toLowerCase().includes('dockerfile')) return 'docker';
    if (filename.toLowerCase().includes('makefile')) return 'makefile';
    if (filename.toLowerCase().includes('package.json')) return 'package';
    if (filename.toLowerCase().includes('requirements.txt')) return 'requirements';

    return typeMap[extension] || 'generic';
  }

  parseReview(reviewText, filename) {
    try {
      // Extract sections from the review
      const sections = {
        criticalIssues: this.extractSection(reviewText, 'Critical Issues'),
        securityConcerns: this.extractSection(reviewText, 'Security Concerns'),
        performanceNotes: this.extractSection(reviewText, 'Performance Notes'),
        codeQuality: this.extractSection(reviewText, 'Code Quality Suggestions'),
        positiveFeedback: this.extractSection(reviewText, 'Positive Feedback'),
        rating: this.extractRating(reviewText)
      };

      // Extract line-specific comments
      const lineComments = this.extractLineComments(reviewText);

      return {
        filename,
        sections,
        lineComments,
        fullReview: reviewText,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Error parsing review for ${filename}:`, error.message);
      return {
        filename,
        sections: { criticalIssues: [], rating: 'NEEDS_DISCUSSION' },
        lineComments: [],
        fullReview: reviewText,
        timestamp: new Date().toISOString()
      };
    }
  }

  extractSection(text, sectionName) {
    const regex = new RegExp(`## ${sectionName}[\\s\\S]*?(?=##|$)`, 'i');
    const match = text.match(regex);
    
    if (!match) return [];
    
    const content = match[0].replace(new RegExp(`## ${sectionName}`, 'i'), '').trim();
    
    // Split into individual items (lines starting with - or numbers)
    return content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .filter(line => line.match(/^[-*\d]/))
      .map(line => line.replace(/^[-*\d.)\s]+/, '').trim())
      .filter(item => item.length > 0);
  }

  extractRating(text) {
    const ratingMatch = text.match(/Rate overall:\s*(APPROVE|REQUEST_CHANGES|NEEDS_DISCUSSION)/i);
    return ratingMatch ? ratingMatch[1].toUpperCase() : 'NEEDS_DISCUSSION';
  }

  extractLineComments(text) {
    const lineComments = [];
    
    // Look for line-specific comments in format "Line X:" or "L:X"
    const lineRegex = /(?:Line\s+(\d+)|L:(\d+)):\s*(.+?)(?=\n(?:Line\s+\d+|L:\d+|\n|$))/gi;
    let match;
    
    while ((match = lineRegex.exec(text)) !== null) {
      const lineNumber = parseInt(match[1] || match[2]);
      const comment = match[3].trim();
      
      if (lineNumber && comment) {
        lineComments.push({
          line: lineNumber,
          comment: comment
        });
      }
    }
    
    return lineComments;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { ClaudeClient };
