import { useAuth } from '../context/AuthContext';
import { buildRolePath } from './router';
import type { Role } from './types';

export function useRoleNav() {
  const { role } = useAuth();

  return (path: string) => buildRolePath(role as Role, path);
}
