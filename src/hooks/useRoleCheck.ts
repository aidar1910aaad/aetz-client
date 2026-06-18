import { useEffect, useMemo, useState } from 'react';
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
  const [tokenUserRole, setTokenUserRole] = useState<UserRole | string | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setTokenUserRole(undefined);
        setIsReady(true);
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      setTokenUserRole(payload?.role);
    } catch {
      setTokenUserRole(undefined);
    } finally {
      setIsReady(true);
    }
  }, []);

  const userRole = useMemo(() => {
    return (user?.role || tokenUserRole) as UserRole | string | undefined;
  }, [user?.role, tokenUserRole]);

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
  const isAuthenticated = useMemo(() => !!user || !!tokenUserRole, [user, tokenUserRole]);

  return {
    user,
    userRole,
    canAccess,
    checkPermission,
    isAdminUser,
    isPTOUser,
    isManagerUser,
    isAuthenticated,
    isReady,
  };
}


