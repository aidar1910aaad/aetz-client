export enum UserRole {
  ADMIN = 'admin',
  PTO = 'pto',
  MANAGER = 'manager',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Администратор',
  [UserRole.PTO]: 'Инженер ПТО',
  [UserRole.MANAGER]: 'Менеджер',
};

// Helper function to get role display name
export const getRoleDisplayName = (role: string | undefined | null): string => {
  if (!role) return 'Не указано';
  
  // Приводим роль к нижнему регистру для сравнения
  const normalizedRole = role.toLowerCase().trim();
  
  // Сопоставляем роль с enum значениями
  if (normalizedRole === UserRole.ADMIN) {
    return UserRoleLabels[UserRole.ADMIN];
  }
  if (normalizedRole === UserRole.PTO) {
    return UserRoleLabels[UserRole.PTO];
  }
  if (normalizedRole === UserRole.MANAGER) {
    return UserRoleLabels[UserRole.MANAGER];
  }
  
  // Если роль не найдена, возвращаем исходное значение
  return role;
};

