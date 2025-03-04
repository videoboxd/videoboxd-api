export function hashPassword(password: string) {
  return Bun.password.hash(password);
}
