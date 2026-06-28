import { migrate } from './migrate';

let bootstrapped = false;
export function ensureDb() {
  if (bootstrapped) return;
  migrate();
  bootstrapped = true;
}
