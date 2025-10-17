import { randomUUID } from 'node:crypto';

import type Agent from './agent';
import Environment from './environment';

export default class Project {
  static list: Project[] = [];

  id: string;
  name: string;
  agents: Agent[];
  environments: Environment[];

  constructor({ name }: { name: string }) {
    this.id = `project_${randomUUID()}`;
    this.name = name;
    this.agents = [];
    this.environments = [
      new Environment({ name: 'Development', order: 1 }),
      new Environment({ name: 'Staging', order: 2 }),
      new Environment({ name: 'Production', order: 3 }),
    ];

    Project.list.push(this);
  }
}
