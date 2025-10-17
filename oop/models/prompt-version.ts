import { randomUUID } from 'node:crypto';
import type Prompt from './prompt';

export default class PromptVersion {
  static list: PromptVersion[] = [];

  id: string;
  prompt: Prompt;
  version: number;
  content: string;

  constructor({
    content,
    prompt,
  }: {
    content: string;
    prompt: Prompt;
  }) {
    this.id = `prompt_version_${randomUUID()}`;
    this.prompt = prompt;
    this.version = prompt.latestVersionNumber + 1;
    this.content = content;
  }
}
