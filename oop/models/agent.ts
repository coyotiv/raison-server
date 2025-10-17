import { randomUUID } from 'node:crypto';
import type Organization from './organization';
import type Project from './project';
import type Prompt from './prompt';

export default class Agent {
  static list: Agent[] = [];

  id: string;
  name: string;
  organization: Organization;
  project: Project;
  prompts: Prompt[];

  constructor({
    name,
    organization,
    project,
  }: {
    name: string;
    organization: Organization;
    project: Project;
  }) {
    this.id = `agent_${randomUUID()}`;
    this.name = name;
    this.organization = organization;
    this.project = project;
    this.prompts = [];

    Agent.list.push(this);
  }

  addPrompt(prompt: Prompt) {
    this.prompts.push(prompt);
  }

  removePrompt(prompt: Prompt) {
    this.prompts = this.prompts.filter((p) => p.id !== prompt.id);
  }
}
