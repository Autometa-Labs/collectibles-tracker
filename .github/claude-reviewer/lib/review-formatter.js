class ReviewFormatter {
  constructor() {
    this.emojis = {
      critical: '🚨',
      security: '🔒',
      performance: '⚡',
      quality: '✨',
      positive: '👍',
      approve: '✅',
      requestChanges: '❌',
      needsDiscussion: '💭',
      file: '📄',
      line: '📍',
      summary: '📊'
    };
  }

  generateSummary(reviews) {
    const totalFiles = reviews.length;
    let totalCriticalIssues = 0;
    let totalSecurityConcerns = 0;
    let overallRating = 'APPROVE';
    
    const filesSummary = [];
    
    for (const fileReview of reviews) {
      const review = fileReview.review;
      const criticalCount = review.sections.criticalIssues?.length || 0;
      const securityCount = review.sections.securityConcerns?.length || 0;
      
      totalCriticalIssues += criticalCount;
      totalSecurityConcerns += securityCount;
      
      // Determine overall rating (most restrictive wins)
      if (review.sections.rating === 'REQUEST_CHANGES') {
        overallRating = 'REQUEST_CHANGES';
      } else if (review.sections.rating === 'NEEDS_DISCUSSION' && overallRating !== 'REQUEST_CHANGES') {
        overallRating = 'NEEDS_DISCUSSION';
      }
      
      filesSummary.push({
        filename: fileReview.filename,
        rating: review.sections.rating,
        criticalIssues: criticalCount,
        securityConcerns: securityCount,
        hasPositiveFeedback: (review.sections.positiveFeedback?.length || 0) > 0
      });
    }

    const comment = this.formatSummaryComment(
      totalFiles,
      totalCriticalIssues,
      totalSecurityConcerns,
      overallRating,
      filesSummary
    );

    return {
      rating: overallRating,
      criticalIssues: totalCriticalIssues,
      securityConcerns: totalSecurityConcerns,
      totalFiles,
      comment,
      filesSummary
    };
  }

  formatSummaryComment(totalFiles, criticalIssues, securityConcerns, rating, filesSummary) {
    const ratingEmoji = this.emojis[rating.toLowerCase().replace('_', '')] || this.emojis.needsDiscussion;
    
    let comment = `## ${this.emojis.summary} Claude AI Code Review Summary\n\n`;
    
    // Overall status
    comment += `**Overall Rating:** ${ratingEmoji} **${rating.replace('_', ' ')}**\n\n`;
    
    // Statistics
    comment += `**Review Statistics:**\n`;
    comment += `- ${this.emojis.file} Files reviewed: ${totalFiles}\n`;
    comment += `- ${this.emojis.critical} Critical issues: ${criticalIssues}\n`;
    comment += `- ${this.emojis.security} Security concerns: ${securityConcerns}\n\n`;
    
    // Files breakdown
    if (filesSummary.length > 0) {
      comment += `**Files Reviewed:**\n`;
      for (const file of filesSummary) {
        const fileEmoji = this.emojis[file.rating.toLowerCase().replace('_', '')] || this.emojis.needsDiscussion;
        const issues = file.criticalIssues + file.securityConcerns;
        const issuesText = issues > 0 ? ` (${issues} issues)` : '';
        const positiveText = file.hasPositiveFeedback ? ' 👍' : '';
        
        comment += `- ${fileEmoji} \`${file.filename}\`${issuesText}${positiveText}\n`;
      }
      comment += '\n';
    }
    
    // Action required
    if (rating === 'REQUEST_CHANGES') {
      comment += `${this.emojis.critical} **Action Required:**\n`;
      comment += `This PR has critical issues that must be addressed before merging. Please review the detailed comments below and make the necessary changes.\n\n`;
    } else if (rating === 'NEEDS_DISCUSSION') {
      comment += `${this.emojis.needsDiscussion} **Discussion Needed:**\n`;
      comment += `This PR has some concerns that should be discussed. Please review the comments and consider the suggestions.\n\n`;
    } else {
      comment += `${this.emojis.approve} **Ready to Merge:**\n`;
      comment += `This PR looks good! The code follows best practices and doesn't have any critical issues.\n\n`;
    }
    
    // Footer
    comment += `---\n`;
    comment += `${this.emojis.positive} *Powered by Claude AI (claude-sonnet-4-20250514)*\n`;
    comment += `*Review completed at ${new Date().toISOString()}*`;
    
    return comment;
  }

  formatFileReview(fileReview) {
    const { filename, review } = fileReview;
    const sections = review.sections;
    
    let comment = `## ${this.emojis.file} Review: \`${filename}\`\n\n`;
    
    // Rating
    const ratingEmoji = this.emojis[sections.rating?.toLowerCase().replace('_', '')] || this.emojis.needsDiscussion;
    comment += `**Rating:** ${ratingEmoji} ${sections.rating || 'NEEDS_DISCUSSION'}\n\n`;
    
    // Critical Issues
    if (sections.criticalIssues && sections.criticalIssues.length > 0) {
      comment += `### ${this.emojis.critical} Critical Issues (must fix before merge)\n`;
      for (const issue of sections.criticalIssues) {
        comment += `- ${issue}\n`;
      }
      comment += '\n';
    }
    
    // Security Concerns
    if (sections.securityConcerns && sections.securityConcerns.length > 0) {
      comment += `### ${this.emojis.security} Security Concerns\n`;
      for (const concern of sections.securityConcerns) {
        comment += `- ${concern}\n`;
      }
      comment += '\n';
    }
    
    // Performance Notes
    if (sections.performanceNotes && sections.performanceNotes.length > 0) {
      comment += `### ${this.emojis.performance} Performance Notes\n`;
      for (const note of sections.performanceNotes) {
        comment += `- ${note}\n`;
      }
      comment += '\n';
    }
    
    // Code Quality Suggestions
    if (sections.codeQuality && sections.codeQuality.length > 0) {
      comment += `### ${this.emojis.quality} Code Quality Suggestions\n`;
      for (const suggestion of sections.codeQuality) {
        comment += `- ${suggestion}\n`;
      }
      comment += '\n';
    }
    
    // Positive Feedback
    if (sections.positiveFeedback && sections.positiveFeedback.length > 0) {
      comment += `### ${this.emojis.positive} Positive Feedback\n`;
      for (const feedback of sections.positiveFeedback) {
        comment += `- ${feedback}\n`;
      }
      comment += '\n';
    }
    
    return comment;
  }

  formatLineComment(filename, lineNumber, comment) {
    return `**${this.emojis.line} Line ${lineNumber}:**\n\n${comment}`;
  }

  formatReviewEvent(rating) {
    const eventMap = {
      'APPROVE': 'APPROVE',
      'REQUEST_CHANGES': 'REQUEST_CHANGES',
      'NEEDS_DISCUSSION': 'COMMENT'
    };
    
    return eventMap[rating] || 'COMMENT';
  }

  formatStatusDescription(rating, criticalIssues, securityConcerns) {
    if (rating === 'APPROVE') {
      return 'Code review passed - ready to merge';
    } else if (rating === 'REQUEST_CHANGES') {
      const issues = [];
      if (criticalIssues > 0) issues.push(`${criticalIssues} critical issue${criticalIssues > 1 ? 's' : ''}`);
      if (securityConcerns > 0) issues.push(`${securityConcerns} security concern${securityConcerns > 1 ? 's' : ''}`);
      
      return `Changes required: ${issues.join(', ')}`;
    } else {
      return 'Review completed - discussion needed';
    }
  }

  truncateText(text, maxLength = 1000) {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - 3) + '...';
  }

  escapeMarkdown(text) {
    return text
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/`/g, '\\`')
      .replace(/~/g, '\\~')
      .replace(/\|/g, '\\|');
  }

  formatCodeBlock(code, language = '') {
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }

  formatInlineCode(code) {
    return `\`${code}\``;
  }

  formatBold(text) {
    return `**${text}**`;
  }

  formatItalic(text) {
    return `*${text}*`;
  }

  formatLink(text, url) {
    return `[${text}](${url})`;
  }

  formatList(items, ordered = false) {
    const marker = ordered ? '1.' : '-';
    return items.map((item, index) => {
      const num = ordered ? `${index + 1}.` : marker;
      return `${num} ${item}`;
    }).join('\n');
  }

  formatTable(headers, rows) {
    let table = `| ${headers.join(' | ')} |\n`;
    table += `| ${headers.map(() => '---').join(' | ')} |\n`;
    
    for (const row of rows) {
      table += `| ${row.join(' | ')} |\n`;
    }
    
    return table;
  }
}

module.exports = { ReviewFormatter };
