import type { Role, User } from './types';

export interface DemoAccount {
  username: string;
  password: string;
  role: Role;
  label: string;
  path: string;
  permissions: string[];
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    label: 'Administrator',
    path: '/admin',
    permissions: ['Full access to all modules.'],
  },
  {
    username: 'reception',
    password: 'rec123',
    role: 'reception',
    label: 'Reception Officer',
    path: '/reception',
    permissions: [
      'Register customers',
      'Create orders',
      'Receive payments',
      'Print invoices and receipts',
    ],
  },
  {
    username: 'tailor',
    password: 'tai123',
    role: 'tailor',
    label: 'Tailor',
    path: '/tailor',
    permissions: [
      'View customer measurements',
      'Add measurement records',
      'Update order status',
    ],
  },
  {
    username: 'inventory',
    password: 'inv123',
    role: 'inventory',
    label: 'Inventory Officer',
    path: '/inventory',
    permissions: [
      'Manage fabric stock',
      'Record stock movement',
      'Generate inventory reports',
    ],
  },
  {
    username: 'manager',
    password: 'mgr123',
    role: 'manager',
    label: 'Manager',
    path: '/manager',
    permissions: [
      'View reports',
      'Monitor business performance',
      'Approve discounts',
      'Access sales and financial summaries',
    ],
  },
];

export function authenticateDemoUser(username: string, password: string): User | null {
  const account = DEMO_ACCOUNTS.find(
    (entry) => entry.username === username && entry.password === password,
  );

  if (!account) return null;

  return {
    id: account.username,
    email: `${account.username}@demo.local`,
    name: account.label,
    role: account.role,
  };
}
