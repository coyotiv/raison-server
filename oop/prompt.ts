import chalk from 'chalk';

import Environment from './environment';
import PromptVersion from './prompt-version';
import { generateId } from './utils';

export default class Prompt {
  id: string;
  name: string;
  latestVersionNumber: number;
  versions: PromptVersion[];
  environments: Environment[];
  environmentConfig: {
    [key: string]: PromptVersion;
  };

  constructor({
    name,
    content,
  }: {
    name: string;
    content: string;
  }) {
    this.id = `prompt_${generateId()}`;
    this.name = name;
    this.latestVersionNumber = 0;
    this.versions = [];
    this.environments = [
      new Environment({ name: 'Development', order: 1 }),
      new Environment({ name: 'Staging', order: 2 }),
      new Environment({ name: 'Production', order: 3 }),
    ];
    this.environmentConfig = {};

    this.addVersion(content);
  }

  addVersion(content: string) {
    const version = new PromptVersion({
      version: this.latestVersionNumber + 1,
      content,
    });
    this.versions.push(version);
    this.latestVersionNumber = version.version;

    const defaultEnvironment = this.environments.find((environment) => environment.order === 1);
    if (defaultEnvironment) {
      this.environmentConfig[defaultEnvironment.id] = version;
    }

    return version;
  }

  promoteVersionToEnvironment(version: PromptVersion, environment: Environment) {
    this.environmentConfig[environment.id] = version;
  }

  print() {
    const latestVersion = this.versions.find((version) => version.version === this.latestVersionNumber);

    console.log(chalk.yellow('-------------- Prompt --------------'));
    console.log(chalk.yellow(`Name: ${this.name}, ID: ${this.id}`));
    console.log(chalk.yellow(`Latest Version Number: ${this.latestVersionNumber}`));
    console.log(chalk.yellow(`Latest Version Content: ${latestVersion?.content}\n`));
  }
}
