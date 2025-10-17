import { ApiKey, type Environment, type Organization, type Project, type PromptVersion } from './models';

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

type VersionChanges = {
  state: Record<string, number>;
  changes: PromptVersion[];
};

export default class Client {
  initialized = false;
  apiKeyHash: string;
  organization: Organization;
  project: Project;
  environment: Environment;
  private initializationPromise: Promise<void>;
  private promptsCache: Record<string, PromptVersion>;

  constructor({
    apiKey: apiKeyHash,
    environment: environmentName,
  }: {
    apiKey: string;
    environment: string;
  }) {
    this.apiKeyHash = apiKeyHash;
    this.promptsCache = {};

    // Resolve API key to get organization and project IDs
    const apiKey = ApiKey.findByHash(apiKeyHash);
    if (!apiKey) {
      throw new Error('Invalid API key');
    }

    this.organization = apiKey.organization;
    this.project = apiKey.project;

    const environment = this.project.environments.find((e) => e.name === environmentName);
    if (!environment) {
      throw new Error('Environment not found');
    }

    this.environment = environment;

    this.initializationPromise = this.initialize()
      .then(() => {
        this.initialized = true;
      })
      .catch((error) => {
        console.error('Error initializing client', error);
      });

    this.environment.on('activePromptVersionsChanged', this.handlePromptVersionsChanged.bind(this));
  }

  private initialize() {
    // Mock async initialization operation
    return wait(1000);
  }

  private invalidateCache() {
    this.promptsCache = this.environment.activePromptVersions;
  }

  private handlePromptVersionsChanged(payload: VersionChanges) {
    // Convert array to record with prompt ID as key
    const cache: Record<string, PromptVersion> = {};
    const currentCache = this.promptsCache;

    for (const version of payload.changes) {
      cache[version.prompt.id] = version;

      console.log(`------ Environment ${this.environment.name} ------`);
      console.log(`Prompt ${version.prompt.name} updated to version ${version.version}`);
      console.log(`Content: ${version.content}`);
      console.log('--------------------------------');
    }

    this.promptsCache = {
      ...currentCache,
      ...cache,
    };

    if (Object.keys(currentCache).length !== Object.keys(payload.changes).length) {
      this.invalidateCache();
      return;
    }

    for (const promptId in payload.state) {
      if (!currentCache[promptId] || currentCache[promptId].version !== payload.state[promptId]) {
        this.invalidateCache();
        return;
      }
    }
  }

  private async waitForInitialization() {
    await this.initializationPromise;
  }

  async getPrompt({ promptId }: { promptId: string; params: Record<string, unknown> }): Promise<string | undefined> {
    await this.waitForInitialization();

    return this.promptsCache[promptId]?.content;
  }
}
