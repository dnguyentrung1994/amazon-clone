import * as bcrypt from 'bcrypt';

export async function hashPassword(rawPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(rawPassword, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
