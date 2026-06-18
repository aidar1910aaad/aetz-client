import type { User } from '@/api/users';

export function formatUserFullName(user: Pick<User, 'firstName' | 'lastName' | 'username'>) {
  const name = [user.lastName, user.firstName].filter(Boolean).join(' ').trim();
  return name || user.username;
}

export function buildUserLookup(users: User[]) {
  const map = new Map<string, User>();

  for (const user of users) {
    if (user.username) map.set(user.username.toLowerCase(), user);
    if (user.email) map.set(user.email.toLowerCase(), user);
  }

  return map;
}

export function resolveChangedByAuthor(
  changedBy: string,
  lookup: Map<string, User>
): { name: string; login: string | null } {
  if (!changedBy?.trim()) {
    return { name: 'Неизвестный пользователь', login: null };
  }

  const matched = lookup.get(changedBy.toLowerCase());
  if (matched) {
    return {
      name: formatUserFullName(matched),
      login: matched.email || matched.username,
    };
  }

  // Уже сохранено как ФИО
  if (changedBy.includes(' ') && !changedBy.includes('@')) {
    return { name: changedBy, login: null };
  }

  return { name: changedBy, login: null };
}
