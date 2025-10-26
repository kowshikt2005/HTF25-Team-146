const { Octokit } = require('@octokit/rest');
require('dotenv').config({ path: '.env.local' });

class GitHubOAuthService {
  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET;
    this.redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback';
  }

  // Generate OAuth URL for user authorization
  generateAuthUrl(userId, scopes = ['repo', 'user:email']) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state: userId, // Pass user ID for callback
      allow_signup: 'true'
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  // Exchange code for access token
  async getAccessToken(code) {
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
        }),
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting GitHub access token:', error);
      throw error;
    }
  }

  // Create Octokit instance with user's token
  createUserOctokit(accessToken) {
    return new Octokit({
      auth: accessToken,
    });
  }

  // Get user's GitHub profile
  async getUserProfile(accessToken) {
    const octokit = this.createUserOctokit(accessToken);
    const { data } = await octokit.users.getAuthenticated();
    return data;
  }

  // Create repository in user's account
  async createUserRepository(accessToken, repoData) {
    const octokit = this.createUserOctokit(accessToken);
    
    const response = await octokit.repos.createForAuthenticatedUser({
      name: repoData.name,
      description: repoData.description,
      private: repoData.private || false,
      auto_init: true,
    });
    
    return response.data;
  }

  // Add collaborator to user's repository
  async addCollaboratorToUserRepo(accessToken, owner, repo, username, permission = 'push') {
    const octokit = this.createUserOctokit(accessToken);
    
    const response = await octokit.repos.addCollaborator({
      owner: owner,
      repo: repo,
      username: username,
      permission: permission,
    });
    
    return response.data;
  }

  // Get user's repositories
  async getUserRepositories(accessToken) {
    const octokit = this.createUserOctokit(accessToken);
    
    const response = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });
    
    return response.data;
  }
}

const githubOAuthService = new GitHubOAuthService();
module.exports = { githubOAuthService };