import repl from 'node:repl';
import chalk from 'chalk';
import Client from './client';
import { Agent, ApiKey, Organization, Project, Prompt, User } from './models';
import versionManager from './version-manager';

// Initialize state
const agents = new Map<string, Agent>();
const prompts = new Map<string, Prompt>();

let user: User;
let organization: Organization;
let project: Project;
let apiKey: ApiKey;

// Helper functions
const ensureSetup = () => {
  if (!organization || !project) throw new Error('Run setup() first');
};

const createClientForEnv = (env: string): Client => {
  const client = new Client({
    apiKey: apiKey.hash,
    environment: env,
  });
  return client;
};

const setup = () => {
  console.log(chalk.yellow('Setting up default environment...'));

  user = new User({ name: 'Admin User', email: 'admin@example.com' });
  console.log(chalk.green(`✓ Created user: ${user.name}`));

  organization = new Organization({ name: 'Default Organization' });
  organization.addMember(user, 'owner');
  console.log(chalk.green(`✓ Created organization: ${organization.name}`));

  project = new Project({ name: 'Default Project' });
  organization.addProject(project);
  console.log(chalk.green(`✓ Created project: ${project.name}`));

  apiKey = new ApiKey({
    name: 'Default API Key',
    organization,
    project,
  });
  console.log(chalk.green(`✓ Created API key: ${apiKey.name}`));

  createClientForEnv('Development');
  createClientForEnv('Staging');
  createClientForEnv('Production');

  console.log(chalk.green('✓ Connected clients\n'));
};

const createAgent = (name: string) => {
  ensureSetup();
  const agent = new Agent({
    name,
    organization,
    project,
  });
  agents.set(name, agent);
  console.log(chalk.green(`✓ Created agent: ${name}`));
  return agent;
};

const createPrompt = (name: string, content: string) => {
  ensureSetup();
  const prompt = new Prompt({
    name,
    content,
    owner: organization,
  });
  prompts.set(name, prompt);
  console.log(chalk.green(`✓ Created prompt: ${name}`));
  console.log(chalk.gray(`  Owner: ${prompt.owner.name}`));
  console.log(chalk.gray('  Initial draft created'));
  return prompt;
};

const addPromptToAgent = (agentName: string, promptName: string) => {
  const agent = agents.get(agentName);
  const prompt = prompts.get(promptName);
  if (!agent) throw new Error(`Agent "${agentName}" not found`);
  if (!prompt) throw new Error(`Prompt "${promptName}" not found`);

  agent.addPrompt(prompt);
  console.log(chalk.green(`✓ Added "${promptName}" to "${agentName}"`));
};

const publishDraft = (promptName: string, draftIndex = 0) => {
  const prompt = prompts.get(promptName);
  if (!prompt) throw new Error(`Prompt "${promptName}" not found`);

  const draft = prompt.drafts[draftIndex];
  if (!draft) throw new Error(`Draft ${draftIndex} not found for prompt "${promptName}"`);

  const version = prompt.publish({ draft });
  console.log(chalk.green(`✓ Published v${version.version} to "${promptName}"`));
  console.log(chalk.gray('  Deployed to Development'));
  return version;
};

const editPrompt = (promptName: string, content: string) => {
  const prompt = prompts.get(promptName);
  if (!prompt) throw new Error(`Prompt "${promptName}" not found`);

  const draft = prompt.edit({ content });
  console.log(chalk.green(`✓ Created draft for "${promptName}"`));
  console.log(chalk.gray(`  Draft index: ${prompt.drafts.length - 1}`));
  return draft;
};

const promote = (promptName: string, envName: string, versionNumber?: number) => {
  const prompt = prompts.get(promptName);
  if (!prompt) throw new Error(`Prompt "${promptName}" not found`);

  const environment = project.environments.find((e) => e.name.toLowerCase() === envName.toLowerCase());
  if (!environment) throw new Error(`Environment "${envName}" not found`);

  const version = versionNumber
    ? prompt.versions.find((v) => v.version === versionNumber)
    : prompt.versions[prompt.versions.length - 1];

  if (!version) {
    throw new Error(versionNumber ? `Version ${versionNumber} not found` : 'No versions available');
  }

  versionManager.promote({ version, project });
  console.log(chalk.green(`✓ Promoted "${promptName}" v${version.version} to ${environment.name}`));
};

const listAgents = () => {
  if (agents.size === 0) {
    console.log(chalk.yellow('No agents'));
    return;
  }
  console.log(chalk.bold('\nAgents:'));
  for (const [name, agent] of agents) {
    console.log(chalk.cyan(`  • ${name}`) + chalk.gray(` (${agent.prompts.length} prompts)`));
  }
};

const listPrompts = () => {
  if (prompts.size === 0) {
    console.log(chalk.yellow('No prompts'));
    return;
  }
  console.log(chalk.bold('\nPrompts:'));
  for (const [name, prompt] of prompts) {
    console.log(chalk.cyan(`  • ${name}`) + chalk.gray(` (v${prompt.latestVersionNumber})`));
  }
};

const showApiKey = () => {
  if (!apiKey) {
    console.log(chalk.yellow('No API key (run setup() first)'));
    return;
  }
  console.log(chalk.bold('\nAPI Key:'));
  console.log(chalk.cyan(`  Name: ${apiKey.name}`));
  console.log(chalk.cyan(`  Hash: ${apiKey.hash}`));
  console.log(chalk.cyan(`  Active: ${apiKey.isActive}`));
  console.log(chalk.gray(`  Created: ${apiKey.createdAt.toISOString()}`));
};

const help = () => {
  const commands = [
    ['setup()', 'Initialize environment'],
    ['createAgent(name)', 'Create an agent'],
    ['createPrompt(name, content)', 'Create a prompt (creates initial draft)'],
    ['addPromptToAgent(agentName, promptName)', 'Add prompt to agent'],
    ['publishDraft(promptName, [draftIndex])', 'Publish a draft (defaults to draft 0)'],
    ['editPrompt(promptName, content)', 'Create a new draft'],
    ['promote(promptName, env, [version])', 'Promote version to env (defaults to latest)'],
    ['listAgents()', 'List all agents'],
    ['listPrompts()', 'List all prompts'],
    ['showApiKey()', 'Show API key details'],
  ];

  const quickStart = [
    'setup()',
    'createAgent("ChatBot")',
    'createPrompt("greeting", "Hello!")',
    'addPromptToAgent("ChatBot", "greeting")',
    'publishDraft("greeting")              // publish initial draft to Dev',
    'promote("greeting", "Staging")        // promote to staging',
    'editPrompt("greeting", "Hi there!")   // create new draft',
    'publishDraft("greeting", 1)           // publish new draft',
    'promote("greeting", "Staging", 2)     // promote v2 to staging',
    'promote("greeting", "Production", 1)  // rollback: promote v1 to prod',
  ];

  console.log(chalk.bold('\n📚 Available Functions:\n'));
  // biome-ignore lint/complexity/noForEach: intended
  commands.forEach(([cmd, desc]) => {
    console.log(chalk.cyan(`  ${cmd}`) + chalk.gray(` - ${desc}`));
  });

  console.log(chalk.bold('\n📝 Quick Start:'));
  // biome-ignore lint/complexity/noForEach: intentded
  quickStart.forEach((cmd) => {
    console.log(chalk.gray(`  ${cmd}`));
  });
  console.log();
};

// Start REPL
console.log(chalk.bold.blue('\n╔════════════════════════════════════════╗'));
console.log(chalk.bold.blue('║   Raison Interactive REPL             ║'));
console.log(chalk.bold.blue('╚════════════════════════════════════════╝\n'));
console.log(chalk.gray('Type ') + chalk.cyan('help()') + chalk.gray(' for available functions\n'));

const replServer = repl.start({
  prompt: chalk.cyan('raison> '),
  useColors: true,
});

// Expose functions and objects to REPL context
Object.assign(replServer.context, {
  agents,
  prompts,
  setup,
  createAgent,
  createPrompt,
  addPromptToAgent,
  publishDraft,
  editPrompt,
  promote,
  listAgents,
  listPrompts,
  showApiKey,
  help,
});
