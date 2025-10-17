import Environment from './models/environment';
import type Project from './models/project';
import type Prompt from './models/prompt';
import type PromptVersion from './models/prompt-version';

class VersionManager {
  promote({ version, project }: { version: PromptVersion; project: Project }): Environment {
    const currentEnvironment = this.findEnvironmentForVersion(version);
    if (!currentEnvironment) {
      throw new Error('Current environment not found');
    }

    const nextEnvironment = project.environments.find((env) => env.order === currentEnvironment.order + 1) || null;
    if (!nextEnvironment) {
      throw new Error('No next environment found');
    }

    // Set the version as active in the next environment
    nextEnvironment.activePromptVersions = {
      ...nextEnvironment.activePromptVersions,
      [version.prompt.id]: version,
    };

    return nextEnvironment;
  }

  rollbackToVersion({ version, environment }: { version: PromptVersion; environment: Environment }): void {
    environment.activePromptVersions = {
      ...environment.activePromptVersions,
      [version.prompt.id]: version,
    };
  }

  getActiveVersion(prompt: Prompt, environment: Environment): PromptVersion | null {
    return environment.activePromptVersions[prompt.id] || null;
  }

  getEnvironmentsForVersion(prompt: Prompt, version: PromptVersion, environments: Environment[]): Environment[] {
    return environments.filter((env) => env.activePromptVersions[prompt.id]?.id === version.id);
  }

  getVersionsAcrossEnvironments(prompt: Prompt, environments: Environment[]): Map<string, PromptVersion | null> {
    const versionMap = new Map<string, PromptVersion | null>();

    for (const environment of environments) {
      const activeVersion = this.getActiveVersion(prompt, environment);
      versionMap.set(environment.name, activeVersion);
    }

    return versionMap;
  }

  publishPrompt({ version, project }: { version: PromptVersion; project: Project }): void {
    const environmentToPublish = project.environments.find((env) => env.order === project.environments.length);
    if (!environmentToPublish) {
      throw new Error('No environment to publish to');
    }

    environmentToPublish.activePromptVersions = {
      ...environmentToPublish.activePromptVersions,
      [version.prompt.id]: version,
    };
  }

  private findEnvironmentForVersion(version: PromptVersion): Environment | null {
    const environments = Environment.list.filter(
      (env) => env.activePromptVersions[version.prompt.id]?.id === version.id,
    );

    if (environments.length === 0) return null;

    // Return the environment with the highest order (most advanced)
    return environments.reduce((prev, current) => (current.order > prev.order ? current : prev));
  }

  promoteToFirstEnvironment({ version }: { version: PromptVersion }): void {
    const environmentToPromote = Environment.list.find((env) => env.order === 1);
    if (!environmentToPromote) {
      throw new Error('No environment to promote to');
    }

    environmentToPromote.activePromptVersions = {
      ...environmentToPromote.activePromptVersions,
      [version.prompt.id]: version,
    };
  }
}

const versionManager = new VersionManager();

export default versionManager;
