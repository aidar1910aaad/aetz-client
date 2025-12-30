import { useMemo } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { UserRole } from '@/types/user';
import {
  hasPageAccess,
  hasPermission,
  isAdmin,
  isPTO,
  isManager,
} from '@/utils/permissions';

/**
 * Хук для проверки ролей и разрешений пользователя
 * 
 * @example
 * const { userRole, canAccess, isAdminUser, hasPermission: checkPermission } = useRoleCheck();
 * 
 * if (canAccess('/dashboard/users')) {
 *   // Показать страницу пользователей
 * }
 */
export function useRoleCheck() {
  const { user } = useUserStore();

  const userRole = useMemo(() => {
    return user?.role as UserRole | string | undefined;
  }, [user?.role]);

  /**
   * Проверяет, имеет ли пользователь доступ к странице
   */
  const canAccess = (pagePath: string): boolean => {
    return hasPageAccess(userRole, pagePath);
  };

  /**
   * Проверяет, имеет ли пользователь конкретное разрешение
   */
  const checkPermission = (
    permission: keyof Omit<typeof import('@/utils/permissions').rolePermissions[UserRole.ADMIN], 'pages'>
  ): boolean => {
    return hasPermission(userRole, permission);
  };

  /**
   * Проверяет, является ли пользователь администратором
   */
  const isAdminUser = useMemo(() => isAdmin(userRole), [userRole]);

  /**
   * Проверяет, является ли пользователь ПТО
   */
  const isPTOUser = useMemo(() => isPTO(userRole), [userRole]);

  /**
   * Проверяет, является ли пользователь менеджером
   */
  const isManagerUser = useMemo(() => isManager(userRole), [userRole]);

  /**
   * Проверяет, является ли пользователь аутентифицированным
   */
  const isAuthenticated = useMemo(() => !!user, [user]);

  return {
    user,
    userRole,
    canAccess,
    checkPermission,
    isAdminUser,
    isPTOUser,
    isManagerUser,
    isAuthenticated,
  };
}


