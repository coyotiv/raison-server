import type Agent from './agent';
import type Environment from './environment';

export default class Client {
  environment: Environment;

  constructor({ environment }: { environment: Environment }) {
    this.environment = environment;
  }

  getPrompts(agent: Agent) {
    const prompts = agent.prompts;

    return prompts
      .filter((prompt) => prompt.environmentConfig[this.environment.id])
      .map((prompt) => {
        const latestVersionForEnvironment = prompt.environmentConfig[this.environment.id];

        return latestVersionForEnvironment?.content;
      })
      .filter(Boolean);
  }
}
