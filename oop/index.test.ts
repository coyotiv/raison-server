import { beforeEach, describe, expect, it } from 'vitest';
import Client from './client';
import { Agent, ApiKey, Draft, Environment, Organization, Project, Prompt, User } from './models';
import versionManager from './version-manager';

describe('Complete Workflow Integration Test', () => {
  beforeEach(() => {
    // Reset all static lists before each test
    Agent.list = [];
    ApiKey.list = [];
    Draft.list = [];
    Environment.list = [];
    Organization.list = [];
    Project.list = [];
    Prompt.list = [];
    User.list = [];
  });

  it('should handle the complete workflow: create resources, add versions, promote, and rollback', async () => {
    // ============================================
    // SETUP: Create Organization and Project
    // ============================================
    const user = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john.doe@example.com');

    const organization = new Organization({ name: 'Organization 1' });
    expect(organization.name).toBe('Organization 1');

    organization.addMember(user, 'owner');
    expect(organization.members).toHaveLength(1);
    expect(organization.members[0]?.name).toBe(user.name);
    expect(organization.members[0]?.role).toBe('owner');

    const project = new Project({ name: 'Project 1' });
    expect(project.name).toBe('Project 1');
    expect(project.environments).toHaveLength(3);

    organization.addProject(project);
    expect(organization.projects).toHaveLength(1);

    // ============================================
    // API KEY: Create and Verify
    // ============================================
    const apiKey = new ApiKey({
      name: 'Project 1 Main Key',
      organization,
      project,
    });
    expect(apiKey.name).toBe('Project 1 Main Key');
    expect(apiKey.organization.id).toBe(organization.id);
    expect(apiKey.project.id).toBe(project.id);
    expect(apiKey.isActive).toBe(true);

    // Verify API key can be found
    const foundKey = ApiKey.findByHash(apiKey.hash);
    expect(foundKey).toBeDefined();
    expect(foundKey?.id).toBe(apiKey.id);

    const [devEnv, stagingEnv, prodEnv] = project.environments as [Environment, Environment, Environment];

    // ============================================
    // CLIENTS: Create and Connect
    // ============================================
    const devClient = new Client({
      apiKey: apiKey.hash,
      environment: devEnv.name,
    });
    expect(devClient.organization.id).toBe(organization.id);
    expect(devClient.project.id).toBe(project.id);
    expect(devClient.environment.name).toBe(devEnv.name);

    const stagingClient = new Client({
      apiKey: apiKey.hash,
      environment: stagingEnv.name,
    });

    const prodClient = new Client({
      apiKey: apiKey.hash,
      environment: prodEnv.name,
    });

    // ============================================
    // RESOURCES: Create Agent and Prompts
    // ============================================
    const agent = new Agent({
      name: 'Agent 1',
      organization,
      project,
    });
    expect(agent.name).toBe('Agent 1');

    // Wait for client initialization
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const prompt1 = new Prompt({
      name: 'Prompt 1',
      content: 'Prompt 1 - Version 1',
      owner: project,
    });
    expect(prompt1.name).toBe('Prompt 1');
    expect(prompt1.versions).toHaveLength(0); // No versions yet, only draft
    expect(prompt1.drafts).toHaveLength(1); // Initial draft created
    expect(prompt1.drafts[0]?.content).toBe('Prompt 1 - Version 1');
    expect(prompt1.owner.name).toBe(project.name);

    const prompt2 = new Prompt({
      name: 'Prompt 2',
      content: 'Prompt 2 - Version 1',
      owner: project,
    });
    expect(prompt2.name).toBe('Prompt 2');
    expect(prompt2.drafts).toHaveLength(1);

    // ============================================
    // ASSOCIATION: Add Prompts to Agent
    // ============================================
    agent.addPrompt(prompt1);
    agent.addPrompt(prompt2);

    expect(agent.prompts).toHaveLength(2);

    // Publish initial drafts to create versions and deploy to development
    const prompt1Draft1 = prompt1.drafts[0];
    const prompt2Draft1 = prompt2.drafts[0];
    if (!prompt1Draft1 || !prompt2Draft1) {
      throw new Error('Initial drafts not created');
    }
    prompt1.publish({ draft: prompt1Draft1 });
    prompt2.publish({ draft: prompt2Draft1 });

    expect(prompt1.versions).toHaveLength(1);
    expect(prompt2.versions).toHaveLength(1);
    expect(prompt1.drafts).toHaveLength(0); // Draft removed after publish
    expect(prompt2.drafts).toHaveLength(0);

    // Wait a bit for the event to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Dev client should see both prompts (version 1)
    let devPrompt1 = await devClient.getPrompt({ promptId: prompt1.id, params: {} });
    let devPrompt2 = await devClient.getPrompt({ promptId: prompt2.id, params: {} });
    expect(devPrompt1).toBe('Prompt 1 - Version 1');
    expect(devPrompt2).toBe('Prompt 2 - Version 1');

    // Staging and Prod should see no prompts yet
    let stagingPrompt1 = await stagingClient.getPrompt({ promptId: prompt1.id, params: {} });
    let prodPrompt1 = await prodClient.getPrompt({ promptId: prompt1.id, params: {} });
    expect(stagingPrompt1).toBeUndefined();
    expect(prodPrompt1).toBeUndefined();

    // ============================================
    // VERSIONS: Add New Versions
    // ============================================
    // Create new drafts
    const prompt1Draft2 = prompt1.edit({ content: 'Prompt 1 - Version 2' });
    const prompt2Draft2 = prompt2.edit({ content: 'Prompt 2 - Version 2' });

    expect(prompt1.drafts).toHaveLength(1);
    expect(prompt2.drafts).toHaveLength(1);

    // Publish drafts to create version 2
    const prompt1Version2 = prompt1.publish({ draft: prompt1Draft2 });
    prompt2.publish({ draft: prompt2Draft2 });

    expect(prompt1.versions).toHaveLength(2);
    expect(prompt1.latestVersionNumber).toBe(2);
    expect(prompt2.versions).toHaveLength(2);
    expect(prompt1.drafts).toHaveLength(0);

    // Wait for event
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Dev should automatically see version 2
    devPrompt1 = await devClient.getPrompt({ promptId: prompt1.id, params: {} });
    devPrompt2 = await devClient.getPrompt({ promptId: prompt2.id, params: {} });
    expect(devPrompt1).toBe('Prompt 1 - Version 2');
    expect(devPrompt2).toBe('Prompt 2 - Version 2');

    // ============================================
    // PROMOTION: Promote Version 2 to Staging
    // ============================================
    versionManager.promote({
      version: prompt1Version2,
      project,
    });

    // Verify using version manager
    const stagingActiveVersion = versionManager.getActiveVersion(prompt1, stagingEnv);
    expect(stagingActiveVersion?.version).toBe(2);

    // Staging should now see version 2 of prompt1
    stagingPrompt1 = await stagingClient.getPrompt({ promptId: prompt1.id, params: {} });
    expect(stagingPrompt1).toBe('Prompt 1 - Version 2');

    // Prod should still see nothing
    prodPrompt1 = await prodClient.getPrompt({ promptId: prompt1.id, params: {} });
    expect(prodPrompt1).toBeUndefined();

    // ============================================
    // PROMOTION: Promote Version 2 to Production
    // ============================================
    versionManager.promote({
      version: prompt1Version2,
      project,
    });

    // Verify using version manager
    const prodActiveVersion = versionManager.getActiveVersion(prompt1, prodEnv);
    expect(prodActiveVersion?.version).toBe(2);

    // Prod should now see version 2
    prodPrompt1 = await prodClient.getPrompt({ promptId: prompt1.id, params: {} });
    expect(prodPrompt1).toBe('Prompt 1 - Version 2');

    // ============================================
    // NEW VERSION: Add Version 3
    // ============================================
    const prompt1Draft3 = prompt1.edit({ content: 'Prompt 1 - Version 3' });
    expect(prompt1.drafts).toHaveLength(1);

    const prompt1Version3 = prompt1.publish({ draft: prompt1Draft3 });
    expect(prompt1.versions).toHaveLength(3);
    expect(prompt1.latestVersionNumber).toBe(3);
    expect(prompt1.drafts).toHaveLength(0);

    // Wait for event
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Dev should automatically see version 3
    devPrompt1 = await devClient.getPrompt({ promptId: prompt1.id, params: {} });
    expect(devPrompt1).toBe('Prompt 1 - Version 3');

    // Staging and Prod should still see version 2
    stagingPrompt1 = await stagingClient.getPrompt({ promptId: prompt1.id, params: {} });
    expect(stagingPrompt1).toBe('Prompt 1 - Version 2');

    prodPrompt1 = await prodClient.getPrompt({ promptId: prompt1.id, params: {} });
    expect(prodPrompt1).toBe('Prompt 1 - Version 2');

    // ============================================
    // PROMOTION: Promote Version 3 to Staging
    // ============================================
    versionManager.promote({
      version: prompt1Version3,
      project,
    });

    // Staging should now see version 3
    stagingPrompt1 = await stagingClient.getPrompt({ promptId: prompt1.id, params: {} });
    expect(stagingPrompt1).toBe('Prompt 1 - Version 3');

    // Prod should still see version 2
    prodPrompt1 = await prodClient.getPrompt({ promptId: prompt1.id, params: {} });
    expect(prodPrompt1).toBe('Prompt 1 - Version 2');

    // ============================================
    // ROLLBACK: Rollback Staging to Version 2
    // ============================================
    versionManager.rollbackToVersion({
      version: prompt1Version2,
      environment: stagingEnv,
    });

    // Verify rollback using version manager
    const rolledBackVersion = versionManager.getActiveVersion(prompt1, stagingEnv);
    expect(rolledBackVersion?.version).toBe(2);

    // Staging should be back to version 2
    stagingPrompt1 = await stagingClient.getPrompt({ promptId: prompt1.id, params: {} });
    expect(stagingPrompt1).toBe('Prompt 1 - Version 2');

    // ============================================
    // VERSION MANAGER: Test Helper Methods
    // ============================================

    // Test getVersionsAcrossEnvironments
    const versionMap = versionManager.getVersionsAcrossEnvironments(prompt1, project.environments);
    expect(versionMap.get('Development')?.version).toBe(3);
    expect(versionMap.get('Staging')?.version).toBe(2);
    expect(versionMap.get('Production')?.version).toBe(2);

    // Test getEnvironmentsForVersion
    const version2Environments = versionManager.getEnvironmentsForVersion(
      prompt1,
      prompt1Version2,
      project.environments,
    );
    expect(version2Environments).toHaveLength(2);
    expect(version2Environments.map((e) => e.name)).toContain('Staging');
    expect(version2Environments.map((e) => e.name)).toContain('Production');
  });

  it('should handle multiple API keys for the same project', () => {
    const organization = new Organization({ name: 'Org' });
    const project = new Project({ name: 'Project' });

    // Create multiple API keys
    const apiKey1 = new ApiKey({
      name: 'Key 1',
      organization,
      project,
    });

    const apiKey2 = new ApiKey({
      name: 'Key 2',
      organization,
      project,
    });

    expect(apiKey1.hash).not.toBe(apiKey2.hash);

    // Both keys should work
    const client1 = new Client({
      apiKey: apiKey1.hash,
      environment: 'Development',
    });
    expect(client1.project.id).toBe(project.id);

    const client2 = new Client({
      apiKey: apiKey2.hash,
      environment: 'Staging',
    });
    expect(client2.project.id).toBe(project.id);

    // Find all keys for project
    const projectKeys = ApiKey.findByProject(project);
    expect(projectKeys).toHaveLength(2);
  });

  it('should reject revoked API keys', () => {
    const organization = new Organization({ name: 'Org' });
    const project = new Project({ name: 'Project' });

    const apiKey = new ApiKey({
      name: 'Key',
      organization,
      project,
    });

    // Key should work initially
    const client1 = new Client({
      apiKey: apiKey.hash,
      environment: 'Development',
    });
    expect(client1.project.id).toBe(project.id);

    // Revoke the key
    apiKey.revoke();
    expect(apiKey.isActive).toBe(false);

    // Key should no longer work
    expect(() => {
      new Client({
        apiKey: apiKey.hash,
        environment: 'Development',
      });
    }).toThrow('Invalid API key');

    // Reactivate the key
    apiKey.reactivate();
    expect(apiKey.isActive).toBe(true);

    // Key should work again
    const client2 = new Client({
      apiKey: apiKey.hash,
      environment: 'Development',
    });
    expect(client2.project.id).toBe(project.id);
  });

  it('should reject invalid API keys', () => {
    expect(() => {
      new Client({
        apiKey: 'invalid-hash',
        environment: 'Development',
      });
    }).toThrow('Invalid API key');
  });

  it('should handle version manager rollback method', () => {
    const organization = new Organization({ name: 'Org' });
    const project = new Project({ name: 'Project' });
    organization.addProject(project);

    const [_devEnv, stagingEnv] = project.environments as [Environment, Environment, Environment];

    const prompt = new Prompt({
      name: 'Test Prompt',
      content: 'Version 1',
      owner: project,
    });

    // Publish initial draft
    const draft1 = prompt.drafts[0];
    if (!draft1) throw new Error('Draft 1 not created');
    const version1 = prompt.publish({ draft: draft1 });

    // Create and publish version 2
    const draft2 = prompt.edit({ content: 'Version 2' });
    const version2 = prompt.publish({ draft: draft2 });

    // Create and publish version 3
    const draft3 = prompt.edit({ content: 'Version 3' });
    const version3 = prompt.publish({ draft: draft3 });

    // Promote version 3 to staging
    stagingEnv.activePromptVersions = {
      ...stagingEnv.activePromptVersions,
      [prompt.id]: version3,
    };
    expect(versionManager.getActiveVersion(prompt, stagingEnv)?.version).toBe(3);

    // Rollback to version 2
    versionManager.rollbackToVersion({
      version: version2,
      environment: stagingEnv,
    });

    expect(versionManager.getActiveVersion(prompt, stagingEnv)?.version).toBe(2);

    // Rollback to version 1
    versionManager.rollbackToVersion({
      version: version1,
      environment: stagingEnv,
    });

    expect(versionManager.getActiveVersion(prompt, stagingEnv)?.version).toBe(1);
  });

  it('should handle version manager promoteToNextEnvironment', () => {
    const organization = new Organization({ name: 'Org' });
    const project = new Project({ name: 'Project' });
    organization.addProject(project);
    const [devEnv, stagingEnv, prodEnv] = project.environments as [Environment, Environment, Environment];

    const prompt = new Prompt({
      name: 'Test Prompt',
      content: 'Version 1',
      owner: project,
    });

    // Publish initial draft - this auto-deploys to dev
    const draft1 = prompt.drafts[0];
    if (!draft1) throw new Error('Draft 1 not created');
    const version1 = prompt.publish({ draft: draft1 });

    // Version 1 is deployed to dev
    expect(versionManager.getActiveVersion(prompt, devEnv)?.version).toBe(1);

    // Promote to next environment (staging)
    const nextEnv = versionManager.promote({
      version: version1,
      project,
    });

    expect(nextEnv.name).toBe('Staging');
    expect(versionManager.getActiveVersion(prompt, stagingEnv)?.version).toBe(1);

    // Now version is in staging, promote to next environment (production)
    const finalEnv = versionManager.promote({
      version: version1,
      project,
    });

    expect(finalEnv.name).toBe('Production');
    expect(versionManager.getActiveVersion(prompt, prodEnv)?.version).toBe(1);

    // Try to promote beyond production (should fail)
    expect(() => {
      versionManager.promote({
        version: version1,
        project,
      });
    }).toThrow('No next environment found');
  });

  it('should track prompt ownership correctly', () => {
    const organization = new Organization({ name: 'Org' });
    const project = new Project({ name: 'Project' });

    const agent = new Agent({
      name: 'Agent',
      organization,
      project,
    });

    // Prompt owned by organization
    const orgPrompt = new Prompt({
      name: 'Org Prompt',
      content: 'Content',
      owner: organization,
    });
    expect(orgPrompt.owner.name).toBe(organization.name);

    // Prompt owned by project
    const projectPrompt = new Prompt({
      name: 'Project Prompt',
      content: 'Content',
      owner: project,
    });
    expect(projectPrompt.owner.name).toBe(project.name);

    // Prompt owned by agent
    const agentPrompt = new Prompt({
      name: 'Agent Prompt',
      content: 'Content',
      owner: agent,
    });
    expect(agentPrompt.owner.name).toBe(agent.name);
  });
});
