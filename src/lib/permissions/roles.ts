export type UserRole = 'OWNER' | 'ADMIN' | 'SALES_MANAGER' | 'SALES_REP' | 'VIEWER';

export type Permission =
  | 'org:manage'
  | 'org:billing'
  | 'team:invite'
  | 'team:remove'
  | 'team:roles'
  | 'assistants:create'
  | 'assistants:edit'
  | 'assistants:delete'
  | 'assistants:read'
  | 'calls:read'
  | 'calls:initiate'
  | 'calls:delete'
  | 'leads:create'
  | 'leads:edit'
  | 'leads:delete'
  | 'leads:read'
  | 'products:manage'
  | 'knowledge:upload'
  | 'knowledge:manage'
  | 'integrations:manage'
  | 'analytics:view'
  | 'appointments:manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    'org:manage',
    'org:billing',
    'team:invite',
    'team:remove',
    'team:roles',
    'assistants:create',
    'assistants:edit',
    'assistants:delete',
    'assistants:read',
    'calls:read',
    'calls:initiate',
    'calls:delete',
    'leads:create',
    'leads:edit',
    'leads:delete',
    'leads:read',
    'products:manage',
    'knowledge:upload',
    'knowledge:manage',
    'integrations:manage',
    'analytics:view',
    'appointments:manage',
  ],
  ADMIN: [
    'team:invite',
    'assistants:create',
    'assistants:edit',
    'assistants:delete',
    'assistants:read',
    'calls:read',
    'calls:initiate',
    'leads:create',
    'leads:edit',
    'leads:delete',
    'leads:read',
    'products:manage',
    'knowledge:upload',
    'knowledge:manage',
    'integrations:manage',
    'analytics:view',
    'appointments:manage',
  ],
  SALES_MANAGER: [
    'assistants:create',
    'assistants:edit',
    'assistants:read',
    'calls:read',
    'calls:initiate',
    'leads:create',
    'leads:edit',
    'leads:read',
    'products:manage',
    'knowledge:upload',
    'analytics:view',
    'appointments:manage',
  ],
  SALES_REP: [
    'assistants:read',
    'calls:read',
    'calls:initiate',
    'leads:create',
    'leads:edit',
    'leads:read',
    'appointments:manage',
  ],
  VIEWER: [
    'assistants:read',
    'calls:read',
    'leads:read',
    'analytics:view',
  ],
};

export function hasPermission(role: UserRole | string, permission: Permission): boolean {
  const normalizedRole = (role.toUpperCase().replace(/\s+/g, '_')) as UserRole;
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(permission);
}
