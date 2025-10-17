import chalk from 'chalk';

export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export function printSeparator() {
  console.log(chalk.red('\n=====================================\n'));
}
