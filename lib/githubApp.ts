const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');
const { Webhooks } = require('@octokit/webhooks');

class GitHubAppService {
  private octokit: any;
  private webhooks: any;

  constructor() {
    require('dotenv').config({ path: '.env.local' });
    
    // Initialize Octokit with GitHub App authentication
    this.octokit = new Octokit({
      auth: createAppAuth({
        appId: process.env.GITHUB_APP_ID,
        privateKey: process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        installationId: process.env.GITHUB_INSTALLATION_ID,
      }),
    });

    // Initialize webhooks
    this.webhooks = new Webhooks({
      secret: process.env.GITHUB_WEBHOOK_SECRET || 'your-webhook-secret',
    });

    console.log('GitHub App Service initialized');
  }

  // Get installation access token for a specific installation
  async getInstallationToken(installationId: string): Promise<string> {
    try {
      const { data } = await this.octokit.apps.createInstallationAccessToken({
        installation_id: installationId,
      });
      return data.token;
    } catch (error) {
      console.error('Error getting installation token:', error);
      throw error;
    }
  }

  // Create a repository for a project
  async createRepository(projectData: {
    name: string;
    description: string;
    private: boolean;
    owner: string;
  }): Promise<any> {
    try {
      const response = await this.octokit.repos.createInOrg({
        org: projectData.owner,
        name: projectData.name,
        description: projectData.description,
        private: projectData.private,
        auto_init: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating repository:', error);
      throw error;
    }
  }

  // Add collaborator to repository
  async addCollaborator(repoOwner: string, repoName: string, username: string, permission: string = 'push'): Promise<any> {
    try {
      const response = await this.octokit.repos.addCollaborator({
        owner: repoOwner,
        repo: repoName,
        username: username,
        permission: permission,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  }

  // Remove collaborator from repository
  async removeCollaborator(repoOwner: string, repoName: string, username: string): Promise<any> {
    try {
      await this.octokit.repos.removeCollaborator({
        owner: repoOwner,
        repo: repoName,
        username: username,
      });
      return { success: true };
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  }

  // Get repository commits
  async getCommits(repoOwner: string, repoName: string, since?: string): Promise<any[]> {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: repoOwner,
        repo: repoName,
        since: since,
        per_page: 100,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting commits:', error);
      throw error;
    }
  }

  // Get pull requests
  async getPullRequests(repoOwner: string, repoName: string, state: string = 'open'): Promise<any[]> {
    try {
      const response = await this.octokit.pulls.list({
        owner: repoOwner,
        repo: repoName,
        state: state,
        per_page: 100,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting pull requests:', error);
      throw error;
    }
  }

  // Create pull request
  async createPullRequest(repoOwner: string, repoName: string, prData: {
    title: string;
    head: string;
    base: string;
    body?: string;
  }): Promise<any> {
    try {
      const response = await this.octokit.pulls.create({
        owner: repoOwner,
        repo: repoName,
        title: prData.title,
        head: prData.head,
        base: prData.base,
        body: prData.body,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating pull request:', error);
      throw error;
    }
  }

  // Merge pull request
  async mergePullRequest(repoOwner: string, repoName: string, pullNumber: number, mergeMethod: string = 'merge'): Promise<any> {
    try {
      const response = await this.octokit.pulls.merge({
        owner: repoOwner,
        repo: repoName,
        pull_number: pullNumber,
        merge_method: mergeMethod,
      });
      return response.data;
    } catch (error) {
      console.error('Error merging pull request:', error);
      throw error;
    }
  }

  // Get repository information
  async getRepository(repoOwner: string, repoName: string): Promise<any> {
    try {
      const response = await this.octokit.repos.get({
        owner: repoOwner,
        repo: repoName,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting repository:', error);
      throw error;
    }
  }

  // Get repository collaborators
  async getCollaborators(repoOwner: string, repoName: string): Promise<any[]> {
    try {
      const response = await this.octokit.repos.listCollaborators({
        owner: repoOwner,
        repo: repoName,
        per_page: 100,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting collaborators:', error);
      throw error;
    }
  }

  // Get repository branches
  async getBranches(repoOwner: string, repoName: string): Promise<any[]> {
    try {
      const response = await this.octokit.repos.listBranches({
        owner: repoOwner,
        repo: repoName,
        per_page: 100,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting branches:', error);
      throw error;
    }
  }

  // Create branch
  async createBranch(repoOwner: string, repoName: string, branchName: string, fromBranch: string = 'main'): Promise<any> {
    try {
      // Get the SHA of the base branch
      const { data: baseBranch } = await this.octokit.repos.getBranch({
        owner: repoOwner,
        repo: repoName,
        branch: fromBranch,
      });

      const response = await this.octokit.git.createRef({
        owner: repoOwner,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: baseBranch.commit.sha,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  // Get file content
  async getFileContent(repoOwner: string, repoName: string, path: string, branch: string = 'main'): Promise<any> {
    try {
      const response = await this.octokit.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: path,
        ref: branch,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  }

  // Create or update file
  async createOrUpdateFile(repoOwner: string, repoName: string, path: string, content: string, message: string, branch: string = 'main'): Promise<any> {
    try {
      // Check if file exists
      let sha = null;
      try {
        const existingFile = await this.getFileContent(repoOwner, repoName, path, branch);
        sha = existingFile.sha;
      } catch (error) {
        // File doesn't exist, that's okay
      }

      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner: repoOwner,
        repo: repoName,
        path: path,
        message: message,
        content: Buffer.from(content).toString('base64'),
        sha: sha,
        branch: branch,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating/updating file:', error);
      throw error;
    }
  }

  // Setup webhook handlers
  setupWebhooks() {
    // Handle push events
    this.webhooks.on('push', async ({ payload }) => {
      console.log('Push event received:', payload);
      // This will be handled by the webhook route
    });

    // Handle pull request events
    this.webhooks.on('pull_request', async ({ payload }) => {
      console.log('Pull request event received:', payload);
      // This will be handled by the webhook route
    });

    // Handle installation events
    this.webhooks.on('installation', async ({ payload }) => {
      console.log('Installation event received:', payload);
      // This will be handled by the webhook route
    });

    return this.webhooks;
  }

  // Verify webhook signature
  verifyWebhook(payload: string, signature: string): boolean {
    try {
      return this.webhooks.verify(payload, signature);
    } catch (error) {
      console.error('Error verifying webhook:', error);
      return false;
    }
  }
}

export const githubAppService = new GitHubAppService();
