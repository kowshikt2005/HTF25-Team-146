const { Octokit } = require('@octokit/rest');

class GitHubViewer {
  constructor() {
    // Public GitHub API (no authentication needed for public repos)
    this.octokit = new Octokit();
  }

  // Parse GitHub URL to extract owner and repo
  parseGitHubUrl(url) {
    try {
      // Clean up the URL
      let cleanUrl = url.trim();
      
      // Handle various GitHub URL formats
      const patterns = [
        // https://github.com/owner/repo
        /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\s]+?)(?:\.git)?(?:\/.*)?$/i,
        // github.com/owner/repo
        /(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\s]+?)(?:\.git)?(?:\/.*)?$/i,
        // owner/repo format
        /^([^\/\s]+)\/([^\/\s]+)$/
      ];

      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match) {
          const owner = match[1].trim();
          const repo = match[2].replace('.git', '').trim();
          
          // Validate owner and repo names
          if (owner && repo && owner !== '' && repo !== '') {
            return { owner, repo };
          }
        }
      }
      
      throw new Error('Invalid GitHub URL format. Expected format: https://github.com/owner/repository');
    } catch (error) {
      console.error('Error parsing GitHub URL:', error);
      throw new Error('Invalid GitHub URL format. Please use: https://github.com/owner/repository');
    }
  }

  // Get essential repository information: name, commits, and README
  async getRepositoryInfo(gitUrl) {
    let owner, repo;
    
    try {
      const parsed = this.parseGitHubUrl(gitUrl);
      owner = parsed.owner;
      repo = parsed.repo;

      // Get repository details
      const { data: repoData } = await this.octokit.repos.get({
        owner,
        repo
      });

      // Get recent commits (last 20 for better history)
      const { data: commits } = await this.octokit.repos.listCommits({
        owner,
        repo,
        per_page: 20
      });

      // Get README file
      let readme = null;
      try {
        const { data: readmeData } = await this.octokit.repos.getReadme({
          owner,
          repo
        });
        
        // Decode base64 content
        const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
        readme = {
          name: readmeData.name,
          content: readmeContent,
          downloadUrl: readmeData.download_url,
          htmlUrl: readmeData.html_url
        };
      } catch (error) {
        // README might not exist
        readme = null;
      }

      return {
        repository: {
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description,
          url: repoData.html_url,
          defaultBranch: repoData.default_branch,
          isPrivate: repoData.private,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          language: repoData.language,
          createdAt: repoData.created_at,
          updatedAt: repoData.updated_at,
          pushedAt: repoData.pushed_at,
          owner: {
            login: repoData.owner.login,
            avatarUrl: repoData.owner.avatar_url,
            type: repoData.owner.type
          }
        },
        commits: commits.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: {
            name: commit.commit.author.name,
            email: commit.commit.author.email,
            date: commit.commit.author.date,
            login: commit.author?.login,
            avatarUrl: commit.author?.avatar_url
          },
          url: commit.html_url
        })),
        readme: readme
      };
    } catch (error) {
      console.error('Error fetching repository info:', error);
      
      // Handle specific GitHub API errors
      if (error.status === 404) {
        const repoUrl = owner && repo ? `https://github.com/${owner}/${repo}` : gitUrl;
        throw new Error(`Repository not found: ${repoUrl}\n\nPlease check:\n• Repository exists and is public\n• Owner/repository name is correct\n• URL format is valid`);
      } else if (error.status === 403) {
        throw new Error(`Access denied. This repository might be private or you've hit the rate limit.`);
      } else if (error.status === 401) {
        throw new Error(`Authentication required. This repository might be private.`);
      } else {
        throw new Error(`Failed to fetch repository information: ${error.message}`);
      }
    }
  }

  // Get commit activity for the last 30 days
  async getCommitActivity(gitUrl) {
    try {
      const { owner, repo } = this.parseGitHubUrl(gitUrl);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: commits } = await this.octokit.repos.listCommits({
        owner,
        repo,
        since: thirtyDaysAgo.toISOString(),
        per_page: 100
      });

      // Group commits by date
      const commitsByDate = {};
      commits.forEach(commit => {
        const date = commit.commit.author.date.split('T')[0];
        if (!commitsByDate[date]) {
          commitsByDate[date] = [];
        }
        commitsByDate[date].push({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          authorLogin: commit.author?.login,
          url: commit.html_url
        });
      });

      return {
        totalCommits: commits.length,
        commitsByDate,
        topContributors: this.getTopContributors(commits)
      };
    } catch (error) {
      console.error('Error fetching commit activity:', error);
      
      // Re-throw with better error message
      if (error.status === 404) {
        throw new Error(`Repository not found or commit activity unavailable for: ${gitUrl}`);
      }
      throw error;
    }
  }

  // Helper function to get top contributors from commits
  getTopContributors(commits) {
    const contributors = {};
    
    commits.forEach(commit => {
      const author = commit.author?.login || commit.commit.author.name;
      if (!contributors[author]) {
        contributors[author] = {
          name: commit.commit.author.name,
          login: commit.author?.login,
          avatarUrl: commit.author?.avatar_url,
          commits: 0
        };
      }
      contributors[author].commits++;
    });

    return Object.values(contributors)
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 5);
  }
}

const githubViewer = new GitHubViewer();
module.exports = { githubViewer };