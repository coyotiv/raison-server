import Client from './client';
import { Agent, ApiKey, type Environment, Organization, Project, Prompt, User } from './models';
import type Draft from './models/draft';
import versionManager from './version-manager';

async function main() {
  // Create user and organization through API
  const user = new User({
    name: 'John Doe',
    email: 'john.doe@example.com',
  });
  const organization = new Organization({ name: 'Organization 1' });
  organization.addMember(user, 'owner');

  // Create project and add it to organization
  const project = new Project({ name: 'Project 1' });
  organization.addProject(project);

  // Create API key for the project
  const apiKey = new ApiKey({
    name: 'Project 1 Main Key',
    organization,
    project,
  });

  const [devEnv, stagingEnv, prodEnv] = project.environments as [Environment, Environment, Environment];

  // Create clients and connect them first so they can receive all events
  new Client({
    apiKey: apiKey.hash,
    environment: devEnv.name,
  });
  new Client({
    apiKey: apiKey.hash,
    environment: stagingEnv.name,
  });
  new Client({
    apiKey: apiKey.hash,
    environment: prodEnv.name,
  });

  // Now create resources - clients will receive all events
  const agent = new Agent({
    name: 'Agent 1',
    organization,
    project,
  });

  const prompt1 = new Prompt({
    name: 'Prompt 1',
    content: 'Prompt 1 - Version 1',
    owner: project,
  });
  const prompt2 = new Prompt({
    name: 'Prompt 2',
    content: 'Prompt 2 - Version 1',
    owner: project,
  });

  agent.addPrompt(prompt1);
  agent.addPrompt(prompt2);

  const prompt1Version1 = prompt1.publish({
    draft: prompt1.drafts[0] as Draft,
  });

  // Promote prompt1v1 to staging
  console.log('\n\n# Promoting prompt1v1 to staging');
  versionManager.promote({
    version: prompt1Version1,
    project,
  });

  const prompt1Draft2 = prompt1.edit({
    content: 'Prompt 1 - Version 2',
  });
  const prompt1Version2 = prompt1.publish({
    draft: prompt1Draft2,
  });

  const prompt2Draft2 = prompt2.edit({
    content: 'Prompt 2 - Version 2',
  });
  const prompt2Version2 = prompt2.publish({
    draft: prompt2Draft2,
  });

  // Promote prompt1v2 to staging
  console.log('\n\n# Promoting prompt1v2 to staging');
  versionManager.promote({
    version: prompt1Version2,
    project,
  });

  // Promote prompt1v2 to prod
  console.log('\n\n# Promoting prompt1v2 to prod');
  versionManager.promote({
    version: prompt1Version2,
    project,
  });

  // Promote prompt2v2 to staging
  console.log('\n\n# Promoting prompt2v2 to staging');
  versionManager.promote({
    version: prompt2Version2,
    project,
  });

  const prompt1Draft3 = prompt1.edit({
    content: 'Prompt 1 - Version 3',
  });
  const prompt1Version3 = prompt1.publish({
    draft: prompt1Draft3,
  });

  // Promote prompt1v3 to staging
  console.log('\n\n# Promoting prompt1v3 to staging');
  versionManager.promote({
    version: prompt1Version3,
    project,
  });

  // Rollback staging to prompt1v2
  console.log('\n\n# Rolling back staging to prompt1v2');
  versionManager.rollbackToVersion({
    version: prompt1Version2,
    environment: stagingEnv,
  });
}

main();
