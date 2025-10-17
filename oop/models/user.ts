import { randomUUID } from 'node:crypto';

export default class User {
  static list: User[] = [];

  id: string;
  name: string;
  email: string;

  constructor({ name, email }: { name: string; email: string }) {
    this.id = `user_${randomUUID()}`;
    this.name = name;
    this.email = email;
  }
}
