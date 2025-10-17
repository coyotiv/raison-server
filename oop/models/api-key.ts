import { createHash, randomUUID } from 'node:crypto';
import type Organization from './organization';
import type Project from './project';

export default class ApiKey {
  static list: ApiKey[] = [];

  id: string;
  name: string;
  hash: string;
  organization: Organization;
  project: Project;
  createdAt: Date;
  isActive: boolean;

  constructor({
    name,
    organization,
    project,
  }: {
    name: string;
    organization: Organization;
    project: Project;
  }) {
    this.id = `apikey_${randomUUID()}`;
    this.name = name;
    this.organization = organization;
    this.project = project;
    this.createdAt = new Date();
    this.isActive = true;

    // Generate a secure hash for the API key
    const secret = randomUUID();
    this.hash = createHash('sha256').update(`${this.id}:${secret}:${organization.id}:${project.id}`).digest('hex');

    ApiKey.list.push(this);
  }

  /**
   * Revoke the API key
   */
  revoke(): void {
    this.isActive = false;
  }

  /**
   * Reactivate the API key
   */
  reactivate(): void {
    this.isActive = true;
  }

  /**
   * Find an API key by its hash
   */
  static findByHash(hash: string): ApiKey | undefined {
    return ApiKey.list.find((key) => key.hash === hash && key.isActive);
  }

  /**
   * Find all API keys for a project
   */
  static findByProject(project: Project): ApiKey[] {
    return ApiKey.list.filter((key) => key.project.id === project.id);
  }

  /**
   * Find all API keys for an organization
   */
  static findByOrganization(organization: Organization): ApiKey[] {
    return ApiKey.list.filter((key) => key.organization.id === organization.id);
  }
}
