import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllUsers, User } from '@/api/users';
import { buildUserLookup, resolveChangedByAuthor } from '@/utils/userDisplayName';

export function useUserAuthorResolver() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    getAllUsers(token)
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const lookup = useMemo(() => buildUserLookup(users), [users]);

  const resolveAuthor = useCallback(
    (changedBy: string) => resolveChangedByAuthor(changedBy, lookup),
    [lookup]
  );

  return { resolveAuthor };
}
