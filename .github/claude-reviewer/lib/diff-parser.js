class DiffParser {
  constructor() {
    this.maxFileSize = 50000; // Skip files larger than 50KB
    this.maxTotalSize = 200000; // Skip if total diff is larger than 200KB
  }

  parse(diffText) {
    try {
      if (!diffText || diffText.trim().length === 0) {
        return { files: [], totalSize: 0 };
      }

      const files = [];
      const fileBlocks = this.splitIntoFileBlocks(diffText);
      let totalSize = 0;

      for (const block of fileBlocks) {
        const file = this.parseFileBlock(block);
        if (file && file.content.length <= this.maxFileSize) {
          files.push(file);
          totalSize += file.content.length;
          
          // Stop if we exceed total size limit
          if (totalSize > this.maxTotalSize) {
            console.log(`⚠️  Diff too large (${totalSize} bytes), truncating at ${files.length} files`);
            break;
          }
        }
      }

      return {
        files,
        totalSize,
        truncated: totalSize > this.maxTotalSize
      };

    } catch (error) {
      console.error('❌ Error parsing diff:', error.message);
      return { files: [], totalSize: 0, error: error.message };
    }
  }

  splitIntoFileBlocks(diffText) {
    // Split on "diff --git" markers
    const blocks = diffText.split(/^diff --git /m);
    
    // Remove empty first block if it exists
    if (blocks[0].trim() === '') {
      blocks.shift();
    }
    
    // Add back the "diff --git " prefix to each block
    return blocks.map(block => `diff --git ${block}`);
  }

  parseFileBlock(block) {
    try {
      const lines = block.split('\n');
      
      // Extract file paths from the first line
      const firstLine = lines[0];
      const pathMatch = firstLine.match(/^diff --git a\/(.+) b\/(.+)$/);
      
      if (!pathMatch) {
        return null;
      }

      const filename = pathMatch[2]; // Use the "b/" path (new file path)
      
      // Determine change type
      let changeType = 'modified';
      let oldFilename = pathMatch[1];
      
      // Look for file status indicators
      for (const line of lines) {
        if (line.startsWith('new file mode')) {
          changeType = 'added';
          break;
        } else if (line.startsWith('deleted file mode')) {
          changeType = 'deleted';
          break;
        } else if (line.startsWith('rename from')) {
          changeType = 'renamed';
          break;
        }
      }

      // Extract the actual diff content
      const content = this.extractDiffContent(lines);
      
      // Parse hunks for line-by-line analysis
      const hunks = this.parseHunks(lines);
      
      return {
        filename,
        oldFilename,
        changeType,
        content,
        hunks,
        additions: this.countAdditions(content),
        deletions: this.countDeletions(content),
        isBinary: this.isBinaryFile(content),
        language: this.detectLanguage(filename)
      };

    } catch (error) {
      console.error(`❌ Error parsing file block:`, error.message);
      return null;
    }
  }

  extractDiffContent(lines) {
    const contentLines = [];
    let inContent = false;
    
    for (const line of lines) {
      // Start collecting content after the @@ hunk header
      if (line.startsWith('@@')) {
        inContent = true;
        contentLines.push(line);
        continue;
      }
      
      if (inContent) {
        contentLines.push(line);
      }
    }
    
    return contentLines.join('\n');
  }

  parseHunks(lines) {
    const hunks = [];
    let currentHunk = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('@@')) {
        // Save previous hunk
        if (currentHunk) {
          hunks.push(currentHunk);
        }
        
        // Parse hunk header: @@ -oldStart,oldCount +newStart,newCount @@
        const hunkMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (hunkMatch) {
          currentHunk = {
            oldStart: parseInt(hunkMatch[1]),
            oldCount: parseInt(hunkMatch[2] || '1'),
            newStart: parseInt(hunkMatch[3]),
            newCount: parseInt(hunkMatch[4] || '1'),
            lines: []
          };
        }
      } else if (currentHunk && (line.startsWith(' ') || line.startsWith('+') || line.startsWith('-'))) {
        // Add line to current hunk
        const lineType = line.startsWith('+') ? 'addition' : 
                         line.startsWith('-') ? 'deletion' : 'context';
        
        currentHunk.lines.push({
          type: lineType,
          content: line.substring(1), // Remove the +/- prefix
          oldLineNumber: lineType === 'addition' ? null : currentHunk.oldStart + currentHunk.lines.filter(l => l.type !== 'addition').length,
          newLineNumber: lineType === 'deletion' ? null : currentHunk.newStart + currentHunk.lines.filter(l => l.type !== 'deletion').length
        });
      }
    }
    
    // Add the last hunk
    if (currentHunk) {
      hunks.push(currentHunk);
    }
    
    return hunks;
  }

  countAdditions(content) {
    return (content.match(/^\+/gm) || []).length;
  }

  countDeletions(content) {
    return (content.match(/^-/gm) || []).length;
  }

  isBinaryFile(content) {
    return content.includes('Binary files') || 
           content.includes('GIT binary patch') ||
           content.length === 0;
  }

  detectLanguage(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const languageMap = {
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
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'dockerfile': 'docker',
      'md': 'markdown',
      'tf': 'terraform'
    };

    return languageMap[extension] || 'text';
  }

  getChangedLines(file) {
    const changedLines = [];
    
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.type === 'addition' || line.type === 'deletion') {
          changedLines.push({
            lineNumber: line.newLineNumber || line.oldLineNumber,
            type: line.type,
            content: line.content
          });
        }
      }
    }
    
    return changedLines;
  }

  getAddedLines(file) {
    return this.getChangedLines(file).filter(line => line.type === 'addition');
  }

  getDeletedLines(file) {
    return this.getChangedLines(file).filter(line => line.type === 'deletion');
  }

  getContextAroundLine(file, targetLineNumber, contextLines = 3) {
    const context = [];
    
    for (const hunk of file.hunks) {
      for (let i = 0; i < hunk.lines.length; i++) {
        const line = hunk.lines[i];
        const lineNumber = line.newLineNumber || line.oldLineNumber;
        
        if (Math.abs(lineNumber - targetLineNumber) <= contextLines) {
          context.push({
            lineNumber,
            type: line.type,
            content: line.content,
            distance: Math.abs(lineNumber - targetLineNumber)
          });
        }
      }
    }
    
    return context.sort((a, b) => a.lineNumber - b.lineNumber);
  }
}

module.exports = { DiffParser };
