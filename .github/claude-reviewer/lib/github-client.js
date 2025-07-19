const { Octokit } = require('@octokit/rest');

class GitHubClient {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async getPRDiff(owner, repo, prNumber) {
    try {
      console.log(`📥 Fetching diff for PR #${prNumber}...`);
      
      const response = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
        mediaType: {
          format: 'diff'
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching PR diff:', error.message);
      throw error;
    }
  }

  async getPRFiles(owner, repo, prNumber) {
    try {
      const response = await this.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching PR files:', error.message);
      throw error;
    }
  }

  async postComment(owner, repo, prNumber, body) {
    try {
      console.log(`💬 Posting review comment to PR #${prNumber}...`);
      
      const response = await this.octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body
      });

      console.log(`✅ Comment posted: ${response.data.html_url}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error posting comment:', error.message);
      throw error;
    }
  }

  async postReviewComment(owner, repo, prNumber, filename, line, body) {
    try {
      // Get the PR to find the commit SHA
      const pr = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber
      });

      const response = await this.octokit.pulls.createReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        commit_id: pr.data.head.sha,
        path: filename,
        line: line,
        body: body
      });

      console.log(`📝 Line comment posted on ${filename}:${line}`);
      return response.data;
    } catch (error) {
      // If line-specific comment fails, fall back to general comment
      console.warn(`⚠️  Failed to post line comment on ${filename}:${line}, posting as general comment`);
      
      const fallbackBody = `**${filename}** (Line ${line}):\n\n${body}`;
      return this.postComment(owner, repo, prNumber, fallbackBody);
    }
  }

  async createReview(owner, repo, prNumber, event, body, comments = []) {
    try {
      console.log(`📋 Creating ${event} review for PR #${prNumber}...`);
      
      const reviewData = {
        owner,
        repo,
        pull_number: prNumber,
        event,
        body
      };

      if (comments.length > 0) {
        reviewData.comments = comments.map(comment => ({
          path: comment.filename,
          line: comment.line,
          body: comment.body
        }));
      }

      const response = await this.octokit.pulls.createReview(reviewData);
      
      console.log(`✅ Review created: ${response.data.html_url}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating review:', error.message);
      throw error;
    }
  }

  async updatePRStatus(owner, repo, sha, state, description, context = 'Claude AI Review') {
    try {
      const response = await this.octokit.repos.createCommitStatus({
        owner,
        repo,
        sha,
        state, // 'pending', 'success', 'error', 'failure'
        description,
        context
      });

      console.log(`🏷️  Status updated: ${state} - ${description}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating PR status:', error.message);
      throw error;
    }
  }

  async getPRInfo(owner, repo, prNumber) {
    try {
      const response = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber
      });

      return {
        title: response.data.title,
        body: response.data.body,
        author: response.data.user.login,
        baseBranch: response.data.base.ref,
        headBranch: response.data.head.ref,
        headSha: response.data.head.sha,
        baseSha: response.data.base.sha,
        mergeable: response.data.mergeable,
        draft: response.data.draft,
        additions: response.data.additions,
        deletions: response.data.deletions,
        changedFiles: response.data.changed_files
      };
    } catch (error) {
      console.error('❌ Error fetching PR info:', error.message);
      throw error;
    }
  }

  async getFileContent(owner, repo, path, ref) {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (response.data.type === 'file') {
        return Buffer.from(response.data.content, 'base64').toString('utf8');
      }
      
      return null;
    } catch (error) {
      if (error.status === 404) {
        return null; // File doesn't exist
      }
      console.error(`❌ Error fetching file content for ${path}:`, error.message);
      throw error;
    }
  }

  async listPRComments(owner, repo, prNumber) {
    try {
      const response = await this.octokit.issues.listComments({
        owner,
        repo,
        issue_number: prNumber
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error listing PR comments:', error.message);
      throw error;
    }
  }

  async listReviewComments(owner, repo, prNumber) {
    try {
      const response = await this.octokit.pulls.listReviewComments({
        owner,
        repo,
        pull_number: prNumber
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error listing review comments:', error.message);
      throw error;
    }
  }

  async dismissReview(owner, repo, prNumber, reviewId, message) {
    try {
      const response = await this.octokit.pulls.dismissReview({
        owner,
        repo,
        pull_number: prNumber,
        review_id: reviewId,
        message
      });

      console.log(`🗑️  Review dismissed: ${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error dismissing review:', error.message);
      throw error;
    }
  }
}

module.exports = { GitHubClient };
