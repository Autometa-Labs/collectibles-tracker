# Claude AI Code Reviewer - Quick Setup Guide

🤖 **Automated code reviews using Claude AI (claude-sonnet-4-20250514)**

## ⚡ Quick Start (2 minutes)

### 1. Get Claude API Key
- Visit: https://console.anthropic.com
- Create account → API Keys → New Key
- Copy the key (starts with `sk-ant-`)

### 2. Add to GitHub Secrets
- Repository → Settings → Secrets and variables → Actions
- New repository secret:
  - **Name**: `ANTHROPIC_API_KEY`
  - **Value**: Your Claude API key

### 3. Test It!
- Create a test branch and PR
- The Claude AI reviewer will automatically run
- Check the Actions tab for logs

## ✅ What You Get

- **🚨 Critical Issue Detection**: Blocks merges for security vulnerabilities
- **🔒 Security Analysis**: SQL injection, XSS, authentication flaws
- **⚡ Performance Review**: Database queries, memory usage, scalability
- **✨ Code Quality**: Best practices, maintainability, documentation
- **👍 Positive Feedback**: Recognizes good code patterns

## 🎯 Supported Languages

- JavaScript/Node.js, TypeScript, Python
- Docker, Kubernetes/YAML, SQL
- Shell scripts, JSON/Config, Markdown

## 📊 Review Example

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
This PR looks good! The code follows best practices.

---
👍 *Powered by Claude AI (claude-sonnet-4-20250514)*
```

## ⚙️ Configuration

The system is pre-configured for the collectibles-tracker project:

- **Triggers**: PRs to `main`, `develop`, `feature/add_mongo_db`
- **Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Focus**: MongoDB, Express APIs, Kubernetes, Auth0
- **Rules**: Security, performance, code quality patterns

## 🔧 Customization

Edit `.github/claude-reviewer/config/review-rules.json`:

```json
{
  "triggerBranches": ["main", "develop"],
  "skipPatterns": ["node_modules/**", "*.lock"],
  "securityRules": { ... },
  "performanceRules": { ... }
}
```

## 🚀 Features

### Security Focus
- Input validation detection
- SQL injection prevention
- XSS vulnerability scanning
- Authentication flow analysis
- Secrets management review

### Performance Analysis
- Database query optimization
- Memory usage patterns
- Async/await best practices
- Resource cleanup verification
- Scalability considerations

### Code Quality
- Best practices enforcement
- Naming convention checks
- Documentation quality
- Error handling patterns
- Test coverage gaps

### Smart Blocking
- **APPROVE**: ✅ Ready to merge
- **REQUEST_CHANGES**: ❌ Blocks merge (critical issues)
- **NEEDS_DISCUSSION**: 💭 Requires discussion

## 📁 File Structure

```
.github/
├── workflows/
│   └── claude-review.yml          # GitHub Actions workflow
└── claude-reviewer/
    ├── index.js                   # Main orchestrator
    ├── package.json               # Dependencies
    ├── lib/
    │   ├── claude-client.js       # Claude AI integration
    │   ├── github-client.js       # GitHub API client
    │   ├── diff-parser.js         # Code diff analysis
    │   └── review-formatter.js    # Comment formatting
    ├── templates/
    │   └── review-prompts.js      # AI prompts
    ├── config/
    │   └── review-rules.json      # Configuration
    ├── README.md                  # Full documentation
    └── DEPLOYMENT.md              # Setup guide
```

## 🔍 How It Works

1. **Trigger**: PR created/updated on configured branches
2. **Fetch**: Gets code diff from GitHub API
3. **Parse**: Analyzes changes by file type and language
4. **Review**: Sends to Claude AI with specialized prompts
5. **Format**: Processes AI response into structured feedback
6. **Post**: Comments on PR with detailed review
7. **Status**: Updates PR status (approve/block/discuss)

## 🛠️ Troubleshooting

### Common Issues

**API Key Error**
```bash
Error: Invalid API key
```
→ Check `ANTHROPIC_API_KEY` in GitHub secrets

**Rate Limiting**
```bash
Error: Rate limit exceeded
```
→ System auto-retries with backoff

**Large PR Timeout**
```bash
Error: Request timeout
```
→ System auto-truncates large diffs

**Permission Error**
```bash
Error: Resource not accessible
```
→ Check workflow permissions in `.github/workflows/claude-review.yml`

### Debug Logs

Check **Actions** tab → **Claude AI Code Review** → View logs:

```bash
🤖 Starting Claude AI Code Review...
📋 Reviewing PR #123 in owner/repo
📁 Found 3 files to review
🔍 Reviewing server/routes/cards.js...
🧠 Sending to Claude (claude-sonnet-4-20250514)...
💬 Posting review comment to PR #123...
✅ Code review completed successfully!
```

## 📚 Documentation

- **README.md**: Complete feature documentation
- **DEPLOYMENT.md**: Detailed setup and configuration
- **config/review-rules.json**: All configuration options

## 🎉 Ready to Use!

The Claude AI Code Reviewer is now active on your repository:

1. ✅ **Automatic Reviews**: Every PR gets intelligent analysis
2. ✅ **Security Focus**: Blocks dangerous code patterns
3. ✅ **Performance Optimization**: Suggests improvements
4. ✅ **Quality Assurance**: Enforces best practices
5. ✅ **Smart Blocking**: Only blocks for critical issues

**Next PR will be automatically reviewed by Claude AI! 🚀**

---

**Need help?** Check the full documentation in `.github/claude-reviewer/README.md`
