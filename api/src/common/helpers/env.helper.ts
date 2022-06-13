import { existsSync } from 'fs';
import { resolve } from 'path';

export function getEnvPath(dest: string): string {
  const env: string | undefined = process.env.NODE_ENV;
  const fallback: string = resolve(`${dest}/.env`);
  const filename: string = env ? `${env}.env` : 'development.env';
  let filePath: string = resolve(`${dest}/${filename}`);

  if (env === 'production' && !existsSync(filename)) return undefined;

  if (!existsSync(filePath)) {
    filePath = fallback;
  }

  console.log(filePath);
  return filePath;
}