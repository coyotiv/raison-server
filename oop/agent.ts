import chalk from 'chalk';

import type Prompt from './prompt';
import { generateId } from './utils';

export default class Agent {
  id: string;
  name: string;
  prompts: Prompt[];

  constructor({ name }: { name: string }) {
    this.id = `agent_${generateId()}`;
    this.name = name;
    this.prompts = [];
  }

  addPrompt(prompt: Prompt) {
    this.prompts.push(prompt);
  }

  removePrompt(prompt: Prompt) {
    this.prompts = this.prompts.filter((p) => p.id !== prompt.id);
  }

  print() {
    console.log(chalk.blue('-------------- Agent --------------'));
    console.log(chalk.blue(`Name: ${this.name}, ID: ${this.id}\n`));

    for (const prompt of this.prompts) {
      prompt.print();
    }
  }
}
