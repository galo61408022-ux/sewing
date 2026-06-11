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
    '/customers',
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
    '/customers',
    '/orders',
    '/payments',
    '/inventory',
    '/staff',
    '/reports',
  ]),
};

export function canAccess(role: Role, path: string): boolean {
  if (!role) return false;
  return permissions[role]?.has(path) ?? false;
}
