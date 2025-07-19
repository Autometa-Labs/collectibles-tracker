# Claude AI Code Reviewer

An automated code review system powered by Claude AI that provides intelligent, context-aware code reviews for GitHub pull requests.

## Features

🤖 **AI-Powered Reviews**: Uses Claude Sonnet 4 (claude-sonnet-4-20250514) for intelligent code analysis  
🔒 **Security Focus**: Detects security vulnerabilities and potential exploits  
⚡ **Performance Analysis**: Identifies performance bottlenecks and optimization opportunities  
✨ **Code Quality**: Ensures best practices and maintainable code  
🚨 **Critical Issue Detection**: Blocks merges for critical issues  
📊 **Comprehensive Reporting**: Detailed reviews with actionable feedback  

## How It Works

1. **Trigger**: Automatically runs on pull requests to configured branches
2. **Analysis**: Claude AI analyzes code changes using specialized prompts
3. **Review**: Posts detailed comments and overall review summary
4. **Status**: Updates PR status to block/allow merging based on findings

## Supported Languages

- **JavaScript/Node.js**: Express APIs, async/await patterns, security validation
- **TypeScript**: Type safety, interface consistency, null handling
- **Python**: PEP 8 compliance, exception handling, security practices
- **Docker**: Security best practices, optimization, health checks
- **Kubernetes/YAML**: Resource limits, security contexts, networking
- **SQL**: Injection prevention, performance optimization
- **Shell Scripts**: Security, error handling, best practices
- **JSON/Config**: Structure validation, secret detection
- **Markdown**: Documentation quality and completeness

## Review Categories

### 🚨 Critical Issues (Blocking)
- Security vulnerabilities
- Logic errors breaking functionality
- Performance regressions
- Data corruption risks
- Memory leaks

### 🔒 Security Concerns
- Input validation issues
- SQL injection vulnerabilities
- XSS prevention
- Authentication/authorization flaws
- Secrets management

### ⚡ Performance Notes
- Database query optimization
- Memory usage patterns
- Scalability implications
- Resource cleanup
- Caching opportunities

### ✨ Code Quality Suggestions
- Best practices adherence
- Code maintainability
- Naming conventions
- Structure improvements
- Documentation quality

### 👍 Positive Feedback
- Well-implemented features
- Good practices followed
- Clean, readable code
- Proper error handling

## Configuration

The system is configured via `.github/claude-reviewer/config/review-rules.json`:

```json
{
  "projectName": "collectibles-tracker",
  "reviewSettings": {
    "model": "claude-sonnet-4-20250514",
    "maxTokens": 4000,
    "temperature": 0.1
  },
  "triggerBranches": ["main", "develop", "feature/add_mongo_db"],
  "skipPatterns": ["node_modules/**", "*.lock", "*.min.js"],
  "criticalPatterns": ["eval(", "innerHTML =", "process.env."],
  "securityRules": { ... },
  "performanceRules": { ... }
}
```

## Project-Specific Context

For the **Collectibles Tracker** project, the reviewer focuses on:

- **Database Schema**: MongoDB relationships and consistency
- **API Security**: Input validation and authentication flows
- **Performance**: Optimization for large collections
- **Data Integrity**: Validation rules and error handling
- **Kubernetes**: Deployment security and resource management

## Review Output Example

```markdown
## 📊 Claude AI Code Review Summary

**Overall Rating:** ✅ **APPROVE**

**Review Statistics:**
- 📄 Files reviewed: 3
- 🚨 Critical issues: 0
- 🔒 Security concerns: 1

**Files Reviewed:**
- ✅ `server/routes/cards.js` 👍
- 💭 `server/models/Card.js` (1 issues)
- ✅ `helm-chart/values.yaml` 👍

✅ **Ready to Merge:**
This PR looks good! The code follows best practices and doesn't have any critical issues.

---
👍 *Powered by Claude AI (claude-sonnet-4-20250514)*
*Review completed at 2025-07-19T19:32:44.000Z*
```

## Integration

### GitHub Actions
Automatically triggered via `.github/workflows/claude-review.yml` on:
- Pull request events (opened, synchronize, reopened)
- Push events to main/develop branches

### Status Checks
- **APPROVE**: ✅ Success status - ready to merge
- **REQUEST_CHANGES**: ❌ Failure status - blocks merge
- **NEEDS_DISCUSSION**: 💭 Pending status - requires discussion

### Comments
- **Summary Comment**: Overall review with statistics and recommendations
- **Line Comments**: Specific feedback on individual lines of code
- **File Reviews**: Detailed analysis per file with categorized feedback

## Dependencies

- **@anthropic-ai/sdk**: Claude AI integration
- **@octokit/rest**: GitHub API client
- **axios**: HTTP requests
- **dotenv**: Environment configuration

## Environment Variables

Required secrets in GitHub repository:

```bash
ANTHROPIC_API_KEY=your_claude_api_key_here
GITHUB_TOKEN=automatically_provided_by_github
```

## Rate Limiting

- Handles Claude API rate limits with exponential backoff
- Respects GitHub API rate limits
- Optimized token usage with intelligent chunking

## File Size Limits

- **Max file size**: 50KB per file
- **Max total diff**: 200KB per PR
- **Auto-truncation**: Large files are truncated with notification

## Customization

### Adding New Languages
1. Update `getFileType()` in `claude-client.js`
2. Add language-specific prompts in `review-prompts.js`
3. Configure rules in `review-rules.json`

### Custom Rules
Add project-specific patterns to `review-rules.json`:

```json
{
  "customPrompts": {
    "your-project": {
      "context": "Your project description",
      "focus": ["Custom focus areas"]
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure `ANTHROPIC_API_KEY` is set in repository secrets
2. **Rate Limiting**: System automatically handles with retries
3. **Large PRs**: Files over limits are skipped with notification
4. **Permissions**: Ensure workflow has `pull-requests: write` permission

### Logs
Check GitHub Actions logs for detailed execution information:
- API calls and responses
- File processing status
- Error messages and stack traces

## Security

- API keys stored as GitHub secrets
- No code or sensitive data logged
- Minimal permissions required
- Secure communication with Claude API

## Performance

- Parallel processing of multiple files
- Intelligent caching of API responses
- Optimized token usage
- Efficient diff parsing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with sample PRs
5. Submit a pull request

The Claude AI reviewer will automatically review your contribution! 🤖

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Open an issue with detailed information
4. Include relevant log snippets and configuration
