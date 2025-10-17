import User from './user';

export default class Member extends User {
  role: string;

  constructor({ name, email, role }: { name: string; email: string; role: string }) {
    super({ name, email });
    this.role = role;
  }
}
