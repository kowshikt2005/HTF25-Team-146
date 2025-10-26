// const { githubAppService } = require('./githubApp'); // Disabled - missing dependencies
const { githubOAuthService } = require('./githubOAuth');
const mongoose = require('mongoose');

class GitHubService {
  constructor() {
    // User GitHub tokens schema
    this.userGitHubTokensSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
      accessToken: String,
      refreshToken: String,
      githubUsername: String,
      githubId: Number,
      avatarUrl: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
  }

  // Get or create UserGitHubTokens model
  getUserGitHubTokensModel() {
    return mongoose.models.UserGitHubTokens || 
           mongoose.model('UserGitHubTokens', this.userGitHubTokensSchema);
  }

  // Store user's GitHub tokens
  async storeUserGitHubTokens(userId, accessToken, githubProfile) {
    const UserGitHubTokens = this.getUserGitHubTokensModel();
    
    await UserGitHubTokens.findOneAndUpdate(
      { userId },
      {
        accessToken,
        githubUsername: githubProfile.login,
        githubId: githubProfile.id,
        avatarUrl: githubProfile.avatar_url,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
  }

  // Get user's GitHub tokens
  async getUserGitHubTokens(userId) {
    const UserGitHubTokens = this.getUserGitHubTokensModel();
    const tokens = await UserGitHubTokens.findOne({ userId });
    return tokens;
  }

  // Check if user has GitHub connected
  async isUserGitHubConnected(userId) {
    const tokens = await this.getUserGitHubTokens(userId);
    return !!tokens?.accessToken;
  }

  // Generate GitHub OAuth URL for user
  generateUserAuthUrl(userId) {
    return githubOAuthService.generateAuthUrl(userId);
  }

  // Connect user's GitHub account
  async connectUserGitHub(userId, code) {
    try {
      // Get access token
      const accessToken = await githubOAuthService.getAccessToken(code);
      
      // Get user profile
      const githubProfile = await githubOAuthService.getUserProfile(accessToken);
      
      // Store tokens
      await this.storeUserGitHubTokens(userId, accessToken, githubProfile);
      
      return {
        success: true,
        profile: githubProfile
      };
    } catch (error) {
      console.error('Error connecting user GitHub:', error);
      throw error;
    }
  }

  // Create repository (user's account or app account)
  async createRepository(userId, repoData, useUserAccount = true) {
    if (useUserAccount) {
      // Create in user's personal GitHub account
      const tokens = await this.getUserGitHubTokens(userId);
      if (!tokens) {
        throw new Error('User GitHub account not connected');
      }
      
      return await githubOAuthService.createUserRepository(tokens.accessToken, repoData);
    } else {
      // Create using GitHub App (organization account) - DISABLED
      throw new Error('GitHub App integration is not configured. Please use personal account.');
    }
  }

  // Add collaborator (works with both user and app accounts)
  async addCollaborator(userId, owner, repo, username, permission = 'push', useUserAccount = true) {
    if (useUserAccount) {
      const tokens = await this.getUserGitHubTokens(userId);
      if (!tokens) {
        throw new Error('User GitHub account not connected');
      }
      
      return await githubOAuthService.addCollaboratorToUserRepo(
        tokens.accessToken, owner, repo, username, permission
      );
    } else {
      throw new Error('GitHub App integration is not configured. Please use personal account.');
    }
  }

  // Get user's repositories
  async getUserRepositories(userId) {
    const tokens = await this.getUserGitHubTokens(userId);
    if (!tokens) {
      throw new Error('User GitHub account not connected');
    }
    
    return await githubOAuthService.getUserRepositories(tokens.accessToken);
  }

  // Get repository choice for user (personal vs organization)
  async getRepositoryOptions(userId) {
    const isConnected = await this.isUserGitHubConnected(userId);
    
    return {
      canUsePersonalAccount: isConnected,
      canUseOrganizationAccount: false, // GitHub App is not configured
      personalAccountInfo: isConnected ? await this.getUserGitHubTokens(userId) : null
    };
  }
}

const githubService = new GitHubService();
module.exports = { githubService };