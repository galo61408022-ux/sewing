import type { Role } from './types';
import { ROLE_BASE_PATHS } from './permissions';

export function buildRolePath(role: Role | null, path: string): string {
  if (!role) return path;
  const basePath = ROLE_BASE_PATHS[role];
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

export function stripRolePrefix(path: string): string {
  const prefixes = Object.values(ROLE_BASE_PATHS);
  for (const prefix of prefixes) {
    if (path.startsWith(prefix)) {
      return path.slice(prefix.length) || '/dashboard';
    }
  }
  return path;
}
