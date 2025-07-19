class ReviewPrompts {
  constructor() {
    this.basePrompt = `You are an expert code reviewer. Analyze this code change and provide a thorough review.

Focus on:
- Logic errors and potential bugs
- Security vulnerabilities 
- Performance issues
- Code maintainability and readability
- Best practices for the language/framework
- Test coverage gaps

Respond with:
## Critical Issues (must fix before merge)
[List any blocking issues with specific line numbers]

## Security Concerns  
[Any security vulnerabilities found]

## Performance Notes
[Potential performance improvements]

## Code Quality Suggestions
[Style, naming, structure improvements]

## Positive Feedback
[What's done well]

Rate overall: APPROVE / REQUEST_CHANGES / NEEDS_DISCUSSION`;
  }

  getReviewPrompt(fileType, file) {
    const specificPrompt = this.getFileTypePrompt(fileType);
    const codeContent = this.formatCodeContent(file);
    
    return `${this.basePrompt}

${specificPrompt}

CODE DIFF:
${codeContent}

File: ${file.filename}
Change Type: ${file.changeType}
Language: ${file.language}
Additions: +${file.additions}
Deletions: -${file.deletions}`;
  }

  getFileTypePrompt(fileType) {
    const prompts = {
      javascript: `
JAVASCRIPT/NODE.JS SPECIFIC FOCUS:
- Check for proper error handling and async/await usage
- Verify security practices (input validation, SQL injection prevention)
- Look for memory leaks and performance bottlenecks
- Ensure proper use of modern ES6+ features
- Check for proper module imports/exports
- Verify API endpoint security and validation`,

      typescript: `
TYPESCRIPT SPECIFIC FOCUS:
- Verify type safety and proper type annotations
- Check for any usage and ensure proper typing
- Look for interface vs type usage consistency
- Verify generic type constraints
- Check for proper null/undefined handling
- Ensure proper async/await typing`,

      python: `
PYTHON SPECIFIC FOCUS:
- Check for PEP 8 compliance and pythonic code
- Verify proper exception handling
- Look for security issues (SQL injection, XSS)
- Check for performance issues (list comprehensions vs loops)
- Verify proper use of context managers
- Check for proper imports and dependencies`,

      docker: `
DOCKER SPECIFIC FOCUS:
- Check for security best practices (non-root user, minimal base images)
- Verify multi-stage builds for optimization
- Look for proper layer caching strategies
- Check for secrets management (no hardcoded credentials)
- Verify proper health checks and resource limits
- Check for minimal attack surface`,

      yaml: `
YAML/KUBERNETES SPECIFIC FOCUS:
- Check for proper resource limits and requests
- Verify security contexts and RBAC
- Look for proper secret management
- Check for proper health checks and probes
- Verify proper networking and service configuration
- Check for proper backup and persistence strategies`,

      json: `
JSON/CONFIG SPECIFIC FOCUS:
- Verify proper JSON structure and syntax
- Check for security issues (exposed secrets, credentials)
- Look for proper configuration management
- Verify environment-specific settings
- Check for proper validation schemas`,

      shell: `
SHELL SCRIPT SPECIFIC FOCUS:
- Check for proper error handling (set -e, set -u)
- Verify input validation and sanitization
- Look for security issues (command injection)
- Check for proper quoting and escaping
- Verify proper exit codes and error messages`,

      sql: `
SQL SPECIFIC FOCUS:
- Check for SQL injection vulnerabilities
- Verify proper indexing strategies
- Look for performance issues (N+1 queries, missing indexes)
- Check for proper transaction handling
- Verify proper data validation and constraints`,

      markdown: `
DOCUMENTATION SPECIFIC FOCUS:
- Check for clarity and completeness
- Verify proper formatting and structure
- Look for outdated information
- Check for proper code examples and syntax
- Verify proper links and references`,

      generic: `
GENERAL CODE REVIEW FOCUS:
- Check for logic errors and edge cases
- Verify proper error handling
- Look for security vulnerabilities
- Check for performance implications
- Verify code maintainability and readability`
    };

    return prompts[fileType] || prompts.generic;
  }

  formatCodeContent(file) {
    if (file.isBinary) {
      return `[Binary file - ${file.filename}]`;
    }

    if (!file.content || file.content.trim().length === 0) {
      return `[No content changes in ${file.filename}]`;
    }

    // Truncate very long diffs
    const maxLength = 8000;
    let content = file.content;
    
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '\n\n[... truncated for length ...]';
    }

    return content;
  }

  getContextPrompt(projectType = 'collectibles-tracker') {
    const contextPrompts = {
      'collectibles-tracker': `
PROJECT CONTEXT - COLLECTIBLES TRACKER:
This is a Node.js/Express application for tracking collectible card values with:
- MongoDB database for data persistence
- Auth0 integration for authentication
- REST API for CRUD operations
- Kubernetes deployment with Helm charts
- Real-time price tracking capabilities

Pay special attention to:
- Database schema consistency and relationships
- API security and input validation
- Authentication and authorization flows
- Performance implications for large collections
- Data integrity and validation rules`,

      'default': `
GENERAL PROJECT CONTEXT:
Review this code change in the context of a production application.
Consider scalability, maintainability, and security implications.`
    };

    return contextPrompts[projectType] || contextPrompts.default;
  }

  getSecurityPrompt() {
    return `
SECURITY CHECKLIST:
- Input validation and sanitization
- SQL injection prevention
- XSS prevention
- Authentication and authorization
- Secrets management (no hardcoded credentials)
- HTTPS/TLS usage
- Rate limiting and DoS protection
- Dependency vulnerabilities
- File upload security
- CORS configuration`;
  }

  getPerformancePrompt() {
    return `
PERFORMANCE CHECKLIST:
- Database query optimization
- Caching strategies
- Memory usage patterns
- CPU-intensive operations
- Network requests optimization
- Bundle size considerations
- Lazy loading opportunities
- Resource cleanup
- Scalability implications`;
  }

  getCriticalIssuesPrompt() {
    return `
CRITICAL ISSUES (BLOCKING):
Issues that MUST be fixed before merge:
- Security vulnerabilities
- Logic errors that break functionality
- Performance regressions
- Breaking API changes without migration
- Data corruption risks
- Memory leaks
- Infinite loops or recursion
- Unhandled exceptions in critical paths`;
  }
}

module.exports = { ReviewPrompts };
