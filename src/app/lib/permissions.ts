import type { Role } from './types';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  reception: 'Reception Officer',
  tailor: 'Tailor',
  inventory: 'Inventory Officer',
  manager: 'Manager',
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-red-100 text-red-700',
  reception: 'bg-blue-100 text-blue-700',
  tailor: 'bg-purple-100 text-purple-700',
  inventory: 'bg-green-100 text-green-700',
  manager: 'bg-orange-100 text-orange-700',
};

export const ROLE_BASE_PATHS: Record<Role, string> = {
  admin: '/admin',
  reception: '/reception',
  tailor: '/tailor',
  inventory: '/inventory',
  manager: '/manager',
};

const permissions: Record<Role, Set<string>> = {
  admin: new Set([
    '/dashboard',
    '/customers',
    '/measurements',
    '/orders',
    '/payments',
    '/inventory',
    '/staff',
    '/reports',
    '/settings',
  ]),
  reception: new Set([
    '/dashboard',
    '/customers',
    '/orders',
    '/payments',
  ]),
  tailor: new Set([
    '/dashboard',
    '/measurements',
    '/orders',
  ]),
  inventory: new Set([
    '/dashboard',
    '/inventory',
    '/reports',
  ]),
  manager: new Set([
    '/dashboard',
    '/orders',
    '/payments',
    '/reports',
  ]),
};

function normalizePath(path: string): string {
  if (!path.startsWith('/')) return path;
  const firstSegment = `/${path.split('/')[1]}`;
  const basePaths = new Set(Object.values(ROLE_BASE_PATHS));
  if (!basePaths.has(firstSegment)) return path;

  const rest = path.slice(firstSegment.length) || '/dashboard';
  if (rest === '/') return '/dashboard';

  const parts = rest.split('/').filter(Boolean);
  if (parts.length === 0) return '/dashboard';
  return `/${parts[0]}`;
}

export function buildRolePath(role: Role, path: string): string {
  return `${ROLE_BASE_PATHS[role]}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getRoleHomePath(role: Role): string {
  return buildRolePath(role, '/dashboard');
}

export function isPathForRole(role: Role, path: string): boolean {
  const base = ROLE_BASE_PATHS[role];
  return path === base || path.startsWith(`${base}/`);
}

export function canAccess(role: Role, path: string): boolean {
  if (!role) return false;
  return permissions[role]?.has(normalizePath(path)) ?? false;
}
