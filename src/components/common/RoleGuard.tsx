'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { UserRole } from '@/types/user';
import PageLoader from '@/shared/loader/PageLoader';

interface RoleGuardProps {
  children: React.ReactNode;
  /**
   * Роли, которым разрешен доступ к этой странице
   * Если не указано, доступ разрешен всем аутентифицированным пользователям
   */
  allowedRoles?: (UserRole | string)[];
  /**
   * Путь страницы для проверки доступа (если не указан, используется текущий путь)
   */
  pagePath?: string;
  /**
   * Редирект на эту страницу, если доступ запрещен
   */
  redirectTo?: string;
  /**
   * Показать сообщение об ошибке вместо редиректа
   */
  showError?: boolean;
  /**
   * Кастомное сообщение об ошибке
   */
  errorMessage?: string;
}

/**
 * Компонент для защиты страниц на основе ролей пользователя
 * 
 * @example
 * // Защита страницы только для админов
 * <RoleGuard allowedRoles={[UserRole.ADMIN]}>
 *   <UsersPage />
 * </RoleGuard>
 * 
 * @example
 * // Защита страницы для нескольких ролей
 * <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PTO]}>
 *   <SettingsPage />
 * </RoleGuard>
 * 
 * @example
 * // Проверка доступа к конкретному пути
 * <RoleGuard pagePath="/dashboard/users" redirectTo="/dashboard">
 *   <UsersPage />
 * </RoleGuard>
 */
export default function RoleGuard({
  children,
  allowedRoles,
  pagePath,
  redirectTo = '/dashboard',
  showError = false,
  errorMessage = 'У вас нет доступа к этой странице',
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userRole, canAccess, isAuthenticated } = useRoleCheck();

  const currentPath = pagePath || pathname;

  useEffect(() => {
    // Если пользователь не аутентифицирован, редиректим на главную
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Если указаны конкретные роли, проверяем их
    if (allowedRoles && allowedRoles.length > 0) {
      const normalizedUserRole = userRole?.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

      if (!normalizedUserRole || !normalizedAllowedRoles.includes(normalizedUserRole)) {
        if (showError) {
          // Можно показать toast или модальное окно
          console.error(errorMessage);
        } else {
          router.push(redirectTo);
        }
        return;
      }
    } else {
      // Если роли не указаны, проверяем доступ к странице через permissions
      if (!canAccess(currentPath)) {
        if (showError) {
          console.error(errorMessage);
        } else {
          router.push(redirectTo);
        }
        return;
      }
    }
  }, [userRole, allowedRoles, currentPath, canAccess, isAuthenticated, router, redirectTo, showError, errorMessage]);

  // Показываем загрузку, пока проверяем доступ
  if (!isAuthenticated || !userRole) {
    return <PageLoader />;
  }

  // Проверяем доступ еще раз перед рендерингом
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedUserRole = userRole?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    if (!normalizedUserRole || !normalizedAllowedRoles.includes(normalizedUserRole)) {
      if (showError) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
          </div>
        );
      }
      return <PageLoader />;
    }
  } else {
    if (!canAccess(currentPath)) {
      if (showError) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
          </div>
        );
      }
      return <PageLoader />;
    }
  }

  return <>{children}</>;
}


