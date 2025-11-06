export enum UserRole {
  ADMIN = 'admin',
  PTO = 'pto',
  MANAGER = 'manager',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Админ',
  [UserRole.PTO]: 'ПТО',
  [UserRole.MANAGER]: 'Менеджер',
};

// Helper function to get role display name
export const getRoleDisplayName = (role: string): string => {
  const roleKey = role.toUpperCase() as keyof typeof UserRoleLabels;
  return UserRoleLabels[roleKey] || role;
};

