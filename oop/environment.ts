import { generateId } from './utils';

export default class Environment {
  id: string;
  name: string;
  order: number;

  constructor({ name, order }: { name: string; order: number }) {
    this.id = `environment_${generateId()}`;
    this.name = name;
    this.order = order;
  }
}
