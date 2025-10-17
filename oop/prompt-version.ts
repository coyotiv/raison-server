import chalk from 'chalk';
import { generateId } from './utils';

export default class PromptVersion {
  id: string;
  version: number;
  content: string;

  constructor({
    version,
    content,
  }: {
    version: number;
    content: string;
  }) {
    this.id = `prompt_version_${generateId()}`;
    this.version = version;
    this.content = content;
  }

  print() {
    console.log(chalk.yellow('-------------- Prompt Version --------------'));
    console.log(chalk.yellow(`Version: ${this.version}, ID: ${this.id}`));
    console.log(chalk.yellow(`Content: ${this.content}\n`));
  }
}
