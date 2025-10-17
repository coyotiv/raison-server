import { randomUUID } from 'node:crypto';
import versionManager from '../version-manager';
import type Agent from './agent';
import Draft from './draft';
import type Organization from './organization';
import type Project from './project';
import PromptVersion from './prompt-version';

export type PromptOwner = Organization | Project | Agent;

export default class Prompt {
  static list: Prompt[] = [];

  id: string;
  name: string;
  latestVersionNumber: number;
  drafts: Draft[];
  versions: PromptVersion[];
  owner: PromptOwner;

  constructor({
    name,
    content,
    owner,
  }: {
    name: string;
    content: string;
    owner: PromptOwner;
  }) {
    this.id = `prompt_${randomUUID()}`;
    this.name = name;
    this.latestVersionNumber = 0;
    this.drafts = [];
    this.versions = [];
    this.owner = owner;

    const draft = new Draft({ content, prompt: this });
    this.drafts.push(draft);

    Prompt.list.push(this);
  }

  publish({ draft }: { draft: Draft }) {
    const version = new PromptVersion({
      prompt: this,
      content: draft.content,
    });
    this.versions.push(version);
    this.latestVersionNumber = version.version;

    this.removeDraft(draft);

    versionManager.promoteToFirstEnvironment({
      version,
    });

    return version;
  }

  edit({ content }: { content: string }) {
    const draft = new Draft({ content, prompt: this });
    this.drafts.push(draft);
    return draft;
  }

  removeDraft(draft: Draft) {
    this.drafts = this.drafts.filter((d) => d.id !== draft.id);
  }
}
