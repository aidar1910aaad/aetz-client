import { UserRole } from '@/types/user';

/**
 * Конфигурация разрешений для разных ролей
 * Определяет, какие страницы и функции доступны каждой роли
 */
export const rolePermissions = {
  [UserRole.ADMIN]: {
    // Админ имеет доступ ко всем страницам
    pages: ['*'],
    // Специальные разрешения
    canManageUsers: true,
    canManageSettings: true,
    canViewAllRequests: true,
    canEditAllRequests: true,
    canDeleteRequests: true,
    canExportData: true,
  },
  [UserRole.PTO]: {
    // ПТО имеет доступ к основным страницам (как и админ, кроме управления пользователями)
    pages: [
      '/dashboard',
      '/dashboard/bktp',
      '/dashboard/bktp/*',
      '/dashboard/requests',
      '/dashboard/requests/*',
      '/dashboard/materials',
      '/dashboard/materials/*',
      '/dashboard/calc',
      '/dashboard/calc/*',
      '/dashboard/final',
      '/dashboard/profile',
      '/dashboard/bmz',
      '/dashboard/bmz/*',
      '/dashboard/settings',
      '/dashboard/settings/*',
      '/dashboard/currency',
      '/dashboard/current-request',
    ],
    canManageUsers: false,
    canManageSettings: true,
    canViewAllRequests: true,
    canEditAllRequests: true,
    canDeleteRequests: false,
    canExportData: true,
  },
  [UserRole.MANAGER]: {
    // Менеджер имеет ограниченный доступ
    // Запрещено:
    // - Настройки БКТП (/dashboard/bktp/settings и все подстраницы)
    // - БКТП страницы (/dashboard/bktp, кроме настроек)
    // - Расчеты (/dashboard/calc)
    // - Финальный просмотр (/dashboard/final)
    // - Настройки системы (/dashboard/settings)
    // Разрешено только просматривать:
    // - Курсы валют (/dashboard/currency) - только просмотр, без редактирования
    pages: [
      '/dashboard',
      '/dashboard/requests',
      '/dashboard/requests/*',
      '/dashboard/materials',
      '/dashboard/materials/*',
      '/dashboard/profile',
      '/dashboard/currency',
    ],
    canManageUsers: false,
    canManageSettings: false,
    canViewAllRequests: true,
    canEditAllRequests: false,
    canDeleteRequests: false,
    canExportData: false,
  },
} as const;

/**
 * Проверяет, имеет ли пользователь доступ к странице
 */
export function hasPageAccess(userRole: UserRole | string | undefined, pagePath: string): boolean {
  if (!userRole) return false;

  const role = userRole.toLowerCase() as UserRole;
  const permissions = rolePermissions[role];

  if (!permissions) return false;

  const pages = permissions.pages as readonly string[];

  // Если есть доступ ко всем страницам (*)
  if (pages.includes('*')) return true;

  // Для менеджера явно блокируем настройки БКТП, расчеты и настройки системы
  if (role === UserRole.MANAGER) {
    if (pagePath.startsWith('/dashboard/bktp/settings')) {
      return false;
    }
    if (pagePath.startsWith('/dashboard/calc')) {
      return false;
    }
    if (pagePath.startsWith('/dashboard/settings')) {
      return false;
    }
  }

  // Проверяем точное совпадение
  if (pages.includes(pagePath)) return true;

  // Проверяем подстановочные пути (например, /dashboard/bktp/*)
  return pages.some((allowedPath) => {
    if (allowedPath.endsWith('/*')) {
      const basePath = allowedPath.slice(0, -2);
      return pagePath.startsWith(basePath);
    }
    return false;
  });
}

/**
 * Проверяет, имеет ли пользователь конкретное разрешение
 */
export function hasPermission(
  userRole: UserRole | string | undefined,
  permission: keyof Omit<typeof rolePermissions[UserRole.ADMIN], 'pages'>
): boolean {
  if (!userRole) return false;

  const role = userRole.toLowerCase() as UserRole;
  const permissions = rolePermissions[role];

  if (!permissions) return false;

  return permissions[permission] ?? false;
}

/**
 * Проверяет, является ли пользователь администратором
 */
export function isAdmin(userRole: UserRole | string | undefined): boolean {
  return userRole?.toLowerCase() === UserRole.ADMIN;
}

/**
 * Проверяет, является ли пользователь ПТО
 */
export function isPTO(userRole: UserRole | string | undefined): boolean {
  return userRole?.toLowerCase() === UserRole.PTO;
}

/**
 * Проверяет, является ли пользователь менеджером
 */
export function isManager(userRole: UserRole | string | undefined): boolean {
  return userRole?.toLowerCase() === UserRole.MANAGER;
}

