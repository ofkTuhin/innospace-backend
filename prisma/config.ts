export type ModuleInput = {
  name: string
  permissions: string[]
}

export const modulesToCreate: ModuleInput[] = [
  { name: 'User', permissions: ['create', 'read', 'update', 'delete'] },
  { name: 'Role', permissions: ['create', 'read', 'update', 'delete'] },
  { name: 'Module', permissions: ['create', 'read', 'update', 'delete'] },
  { name: 'Permission', permissions: ['create', 'read', 'update', 'delete'] },

  {
    name: 'Menu',
    permissions: ['users', 'role', 'module', 'permission'],
  },

  // Add more modules and their permissions as needed
]

export const superAdminRolePermissions = [
  { moduleName: 'User', actions: ['create', 'read', 'update', 'delete'] },

  { moduleName: 'Role', actions: ['read', 'update', 'delete'] },
  { moduleName: 'Module', actions: ['create', 'read', 'update', 'delete'] },
  { moduleName: 'Permission', actions: ['create', 'read', 'update', 'delete'] },

  {
    moduleName: 'Menu',
    actions: ['users', 'role', 'module', 'permission'],
  },
]

export const staffRolePermissions = [
  { moduleName: 'User', actions: ['read'] },

  { moduleName: 'Role', actions: ['read'] },
  { moduleName: 'Module', actions: ['read'] },
  { moduleName: 'Permission', actions: ['read'] },
  {
    moduleName: 'Menu',
    actions: ['users', 'role', 'module', 'permission'],
  },
]
