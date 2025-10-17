import { randomUUID } from 'node:crypto';
import type Prompt from './prompt';

export default class Draft {
  static list: Draft[] = [];

  id: string;
  prompt: Prompt;
  content: string;

  constructor({ content, prompt }: { content: string; prompt: Prompt }) {
    this.id = `draft_${randomUUID()}`;
    this.prompt = prompt;
    this.content = content;

    Draft.list.push(this);
  }
}
