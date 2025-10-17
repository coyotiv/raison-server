import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type PromptVersion from './prompt-version';

export default class Environment extends EventEmitter {
  static list: Environment[] = [];

  id: string;
  name: string;
  order: number;
  #activePromptVersions: Record<string, PromptVersion>;

  constructor({ name, order }: { name: string; order: number }) {
    super();

    this.id = `environment_${randomUUID()}`;
    this.name = name;
    this.order = order;
    this.#activePromptVersions = {};

    Environment.list.push(this);
  }

  get activePromptVersions(): { [key: string]: PromptVersion } {
    return this.#activePromptVersions;
  }

  set activePromptVersions(versions: { [key: string]: PromptVersion }) {
    const currentVersions = this.#activePromptVersions;
    this.#activePromptVersions = versions;

    const state = Object.entries(versions).map(([promptId, version]) => ({
      [promptId]: version.version,
    }));

    const changes = Object.entries(versions)
      .filter(([promptId, version]) => version.version !== currentVersions[promptId]?.version)
      .map(([_, version]) => version);

    this.emit('activePromptVersionsChanged', {
      state,
      changes,
    });
  }
}
