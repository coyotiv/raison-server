import Agent from './agent';
import Client from './client';
import Prompt from './prompt';
import { printSeparator } from './utils';

const agent = new Agent({ name: 'Agent 1' });

const prompt1 = new Prompt({
  name: 'Prompt 1',
  content: 'Prompt 1 - Version 1',
});
const prompt2 = new Prompt({
  name: 'Prompt 2',
  content: 'Prompt 2 - Version 1',
});

const devClient = new Client({
  environment: prompt1.environments[0],
});
const stagingClient = new Client({
  environment: prompt1.environments[1],
});
const prodClient = new Client({
  environment: prompt1.environments[2],
});

agent.addPrompt(prompt1);
agent.addPrompt(prompt2);

agent.print();
printSeparator();

const prompt1Version2 = prompt1.addVersion('Prompt 1 - Version 2');
const _prompt2Version2 = prompt2.addVersion('Prompt 2 - Version 2');

function printClientsPrompts() {
  console.log('Dev Client Prompts:', devClient.getPrompts(agent));
  console.log('Staging Client Prompts:', stagingClient.getPrompts(agent));
  console.log('Prod Client Prompts:', prodClient.getPrompts(agent));
}

printSeparator();

// Promote prompt1v2 to staging
console.log('# Promoting prompt1v2 to staging');
prompt1.promoteVersionToEnvironment(prompt1Version2, prompt1.environments[1]);
printClientsPrompts();
printSeparator();

// Promote prompt1v2 to prod
console.log('# Promoting prompt1v2 to prod');
prompt1.promoteVersionToEnvironment(prompt1Version2, prompt1.environments[2]);
printClientsPrompts();
printSeparator();

const prompt1Version3 = prompt1.addVersion('Prompt 1 - Version 3');

console.log('# Adding prompt1v3');
printClientsPrompts();
printSeparator();

// Promote prompt1v3 to staging
console.log('# Promoting prompt1v3 to staging');
prompt1.promoteVersionToEnvironment(prompt1Version3, prompt1.environments[1]);
printClientsPrompts();
printSeparator();

// Rollback staging to prompt1v2
console.log('# Rolling back staging to prompt1v2');
prompt1.promoteVersionToEnvironment(prompt1Version2, prompt1.environments[1]);
printClientsPrompts();
