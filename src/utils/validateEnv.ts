import { cleanEnv, str, port } from 'envalid';
export function validateEnv() {
  cleanEnv(process.env, {});
}
