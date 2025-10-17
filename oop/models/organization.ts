import { randomUUID } from 'node:crypto';

import Member from './member';
import type Project from './project';
import type User from './user';

export default class Organization {
  static list: Organization[] = [];

  id: string;
  name: string;
  members: Member[];
  projects: Project[];

  constructor({ name }: { name: string }) {
    this.id = `organization_${randomUUID()}`;
    this.name = name;
    this.projects = [];
    this.members = [];
  }

  addProject(project: Project) {
    this.projects.push(project);
  }

  removeProject(project: Project) {
    this.projects = this.projects.filter((p) => p.id !== project.id);
  }

  addMember(user: User, role: string) {
    const member = new Member({ name: user.name, email: user.email, role });
    this.members.push(member);
  }

  removeMember(member: Member) {
    this.members = this.members.filter((m) => m.id !== member.id);
  }
}
