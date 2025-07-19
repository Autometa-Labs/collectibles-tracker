# Claude AI Code Reviewer - Deployment Guide

This guide walks you through setting up the Claude AI Code Reviewer system for your GitHub repository.

## Prerequisites

- GitHub repository with admin access
- Claude API key from Anthropic
- Node.js 18+ (for local testing)

## Quick Setup

### 1. Get Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### 2. Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your Claude API key from step 1

> **Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions

### 3. Configure the System

The system is already configured for the collectibles-tracker project. To customize:

1. Edit `.github/claude-reviewer/config/review-rules.json`
2. Update `triggerBranches` to match your workflow
3. Modify `skipPatterns` for your project structure
4. Customize security and performance rules

### 4. Test the Setup

1. Create a test branch: `git checkout -b test/claude-reviewer`
2. Make a small code change
3. Push and create a pull request
4. The Claude AI reviewer should automatically run

## Detailed Configuration

### Workflow Configuration

The GitHub Actions workflow (`.github/workflows/claude-review.yml`) is configured to:

- **Trigger on**: Pull requests to `main`, `develop`, `feature/add_mongo_db`
- **Permissions**: Read repository, write pull requests and checks
- **Node.js**: Version 18 with npm caching
- **Environment**: All required variables and secrets

### Review Rules Configuration

Edit `.github/claude-reviewer/config/review-rules.json` to customize:

```json
{
  "projectName": "your-project-name",
  "reviewSettings": {
    "model": "claude-sonnet-4-20250514",
    "maxTokens": 4000,
    "temperature": 0.1
  },
  "triggerBranches": ["main", "develop"],
  "skipPatterns": [
    "node_modules/**",
    "*.lock",
    "dist/**"
  ]
}
```

### Security Rules

Add project-specific security patterns:

```json
{
  "securityRules": {
    "javascript": [
      {
        "pattern": "your-security-pattern",
        "message": "Security concern description",
        "severity": "critical|high|medium|low"
      }
    ]
  }
}
```

### Performance Rules

Configure performance checks:

```json
{
  "performanceRules": {
    "javascript": [
      {
        "pattern": "performance-anti-pattern",
        "message": "Performance improvement suggestion",
        "severity": "medium"
      }
    ]
  }
}
```

## Advanced Setup

### Custom Project Context

Add project-specific context for better reviews:

```json
{
  "customPrompts": {
    "your-project": {
      "context": "Description of your project and architecture",
      "focus": [
        "Specific areas to focus on",
        "Important patterns to check",
        "Security considerations"
      ]
    }
  }
}
```

### Branch Protection Rules

To enforce code reviews:

1. Go to **Settings** → **Branches**
2. Add rule for your main branch
3. Enable **Require status checks to pass**
4. Select **Claude AI Code Review** as required check
5. Enable **Require branches to be up to date**

### Notification Setup

Configure Slack notifications (optional):

```json
{
  "integrations": {
    "slack": {
      "enabled": true,
      "webhook": "your-slack-webhook-url",
      "channel": "#code-reviews"
    }
  }
}
```

## Testing

### Local Testing

1. Install dependencies:
   ```bash
   cd .github/claude-reviewer
   npm install
   ```

2. Set environment variables:
   ```bash
   export ANTHROPIC_API_KEY=your_api_key
   export GITHUB_TOKEN=your_github_token
   export PR_NUMBER=123
   export REPO_OWNER=your_username
   export REPO_NAME=your_repo
   ```

3. Run locally:
   ```bash
   node index.js
   ```

### Test Pull Request

Create a test PR with various code changes:

```javascript
// Test file: test-security.js
const userInput = req.body.query;
const sql = `SELECT * FROM users WHERE name = '${userInput}'`; // Should trigger security warning

// Test performance issue
for (let i = 0; i < items.length; i++) { // Should suggest caching length
  await processItem(items[i]); // Should suggest Promise.all
}

// Test code quality
var oldVar = "test"; // Should suggest const/let
if (value == null) { // Should suggest ===
  console.log("Debug message"); // Should suggest proper logging
}
```

## Monitoring

### GitHub Actions Logs

Monitor the system via GitHub Actions:

1. Go to **Actions** tab in your repository
2. Click on **Claude AI Code Review** workflow
3. View logs for each run
4. Check for errors or rate limiting issues

### Review Metrics

Track review effectiveness:

- **Critical issues found**: Security vulnerabilities, logic errors
- **Performance improvements**: Database queries, memory usage
- **Code quality**: Best practices, maintainability
- **False positives**: Adjust rules to reduce noise

## Troubleshooting

### Common Issues

#### 1. API Key Not Working
```
Error: Invalid API key
```
**Solution**: 
- Verify API key is correct in GitHub secrets
- Ensure key has proper permissions
- Check for extra spaces or characters

#### 2. Rate Limiting
```
Error: Rate limit exceeded
```
**Solution**:
- System automatically retries with backoff
- Consider reducing review frequency for large PRs
- Check API usage in Anthropic console

#### 3. Large PR Timeouts
```
Error: Request timeout
```
**Solution**:
- System automatically truncates large diffs
- Consider breaking large PRs into smaller ones
- Adjust `maxFileSize` and `maxTotalSize` in config

#### 4. Permission Errors
```
Error: Resource not accessible by integration
```
**Solution**:
- Ensure workflow has `pull-requests: write` permission
- Check repository settings for Actions permissions
- Verify GitHub token has required scopes

### Debug Mode

Enable verbose logging by adding to workflow:

```yaml
- name: Run Claude AI Review
  env:
    DEBUG: true
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    # ... other env vars
```

### Log Analysis

Common log patterns to look for:

```bash
# Successful review
✅ Code review completed successfully!

# API errors
❌ Claude API error: Rate limit exceeded

# File skipped
⏭️ Skipping large-file.js (52KB > 50KB limit)

# No changes
⏭️ No changes to review
```

## Maintenance

### Regular Updates

1. **Dependencies**: Update npm packages monthly
2. **Model**: Monitor for new Claude model releases
3. **Rules**: Refine based on review feedback
4. **Patterns**: Add new security/performance patterns

### Performance Optimization

1. **Token Usage**: Monitor API costs in Anthropic console
2. **File Limits**: Adjust based on typical PR sizes
3. **Skip Patterns**: Add more file types to skip
4. **Caching**: Consider caching for repeated reviews

### Rule Refinement

Based on review feedback:

1. **False Positives**: Adjust patterns to reduce noise
2. **Missed Issues**: Add new detection patterns
3. **Severity Levels**: Fine-tune critical vs. suggestion
4. **Context**: Improve project-specific prompts

## Security Considerations

### API Key Management
- Store API keys only in GitHub secrets
- Rotate keys regularly
- Monitor usage for anomalies
- Use least-privilege access

### Code Privacy
- Reviews are processed by Claude AI
- No code is stored permanently
- Consider data sensitivity policies
- Review Anthropic's privacy policy

### Access Control
- Limit who can modify workflow files
- Use branch protection for configuration
- Monitor changes to review rules
- Audit API key access

## Support

### Getting Help

1. **Documentation**: Check README.md for features
2. **Logs**: Review GitHub Actions logs for errors
3. **Issues**: Create GitHub issue with details
4. **Community**: Check discussions for similar problems

### Reporting Issues

Include in your issue:
- Error messages from logs
- Configuration files (sanitized)
- Steps to reproduce
- Expected vs. actual behavior
- Repository and PR details (if public)

### Contributing

To improve the system:
1. Fork the repository
2. Create feature branch
3. Test changes thoroughly
4. Submit pull request
5. The system will review its own improvements! 🤖

## Changelog

### Version 1.0.0
- Initial release with Claude Sonnet 4
- Support for 10+ programming languages
- Security, performance, and quality checks
- GitHub Actions integration
- Configurable rules and patterns
- Comprehensive documentation

---

**Need help?** Create an issue or check the troubleshooting section above.
