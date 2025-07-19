#!/usr/bin/env node

const { ClaudeClient } = require('./lib/claude-client');
const { GitHubClient } = require('./lib/github-client');
const { DiffParser } = require('./lib/diff-parser');
const { ReviewFormatter } = require('./lib/review-formatter');
const fs = require('fs').promises;
const path = require('path');

class CodeReviewer {
  constructor() {
    this.claude = new ClaudeClient();
    this.github = new GitHubClient();
    this.diffParser = new DiffParser();
    this.formatter = new ReviewFormatter();
    
    // Environment variables
    this.prNumber = process.env.PR_NUMBER;
    this.repoOwner = process.env.REPO_OWNER;
    this.repoName = process.env.REPO_NAME;
    this.baseSha = process.env.BASE_SHA;
    this.headSha = process.env.HEAD_SHA;
    this.eventName = process.env.EVENT_NAME;
  }

  async run() {
    try {
      console.log('🤖 Starting Claude AI Code Review...');
      
      if (this.eventName !== 'pull_request') {
        console.log('⏭️  Skipping review - not a pull request event');
        return;
      }

      if (!this.prNumber) {
        console.log('⏭️  Skipping review - no PR number found');
        return;
      }

      console.log(`📋 Reviewing PR #${this.prNumber} in ${this.repoOwner}/${this.repoName}`);

      // Get PR diff
      const diff = await this.github.getPRDiff(this.repoOwner, this.repoName, this.prNumber);
      
      if (!diff || diff.trim().length === 0) {
        console.log('⏭️  No changes to review');
        return;
      }

      // Parse diff into reviewable chunks
      const parsedDiff = this.diffParser.parse(diff);
      
      if (parsedDiff.files.length === 0) {
        console.log('⏭️  No reviewable files found');
        return;
      }

      console.log(`📁 Found ${parsedDiff.files.length} files to review`);

      // Review each file with Claude
      const reviews = [];
      for (const file of parsedDiff.files) {
        if (this.shouldSkipFile(file.filename)) {
          console.log(`⏭️  Skipping ${file.filename} (excluded file type)`);
          continue;
        }

        console.log(`🔍 Reviewing ${file.filename}...`);
        
        try {
          const review = await this.claude.reviewCode(file);
          if (review) {
            reviews.push({
              filename: file.filename,
              review: review
            });
          }
        } catch (error) {
          console.error(`❌ Error reviewing ${file.filename}:`, error.message);
        }
      }

      if (reviews.length === 0) {
        console.log('⏭️  No reviews generated');
        return;
      }

      // Format and post reviews
      await this.postReviews(reviews);
      
      console.log('✅ Code review completed successfully!');

    } catch (error) {
      console.error('❌ Code review failed:', error);
      process.exit(1);
    }
  }

  shouldSkipFile(filename) {
    const skipPatterns = [
      /node_modules/,
      /\.lock$/,
      /package-lock\.json$/,
      /yarn\.lock$/,
      /\.min\.js$/,
      /\.min\.css$/,
      /\.map$/,
      /\.log$/,
      /\.tmp$/,
      /\.cache/,
      /dist\//,
      /build\//,
      /coverage\//,
      /\.git/,
      /\.DS_Store/,
      /Thumbs\.db/,
      /\.env$/,
      /\.env\./,
      /\.key$/,
      /\.pem$/,
      /\.p12$/,
      /\.pfx$/
    ];

    return skipPatterns.some(pattern => pattern.test(filename));
  }

  async postReviews(reviews) {
    try {
      // Generate overall summary
      const summary = this.formatter.generateSummary(reviews);
      
      // Post summary comment
      await this.github.postComment(
        this.repoOwner,
        this.repoName,
        this.prNumber,
        summary.comment
      );

      // Post individual file reviews as review comments
      for (const fileReview of reviews) {
        if (fileReview.review.lineComments && fileReview.review.lineComments.length > 0) {
          for (const lineComment of fileReview.review.lineComments) {
            await this.github.postReviewComment(
              this.repoOwner,
              this.repoName,
              this.prNumber,
              fileReview.filename,
              lineComment.line,
              lineComment.comment
            );
          }
        }
      }

      // Save review result for status check
      const result = {
        rating: summary.rating,
        criticalIssues: summary.criticalIssues,
        totalFiles: reviews.length,
        timestamp: new Date().toISOString()
      };

      await fs.writeFile('review-result.json', JSON.stringify(result, null, 2));
      
      console.log(`📊 Review Summary: ${summary.rating} (${reviews.length} files reviewed)`);
      
    } catch (error) {
      console.error('❌ Error posting reviews:', error);
      throw error;
    }
  }
}

// Run the code reviewer
if (require.main === module) {
  const reviewer = new CodeReviewer();
  reviewer.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { CodeReviewer };
