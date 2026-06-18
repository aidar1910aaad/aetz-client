import { useState, useEffect, useMemo, useCallback } from 'react';
import { getMaterialHistoryList, MaterialHistoryWithMaterial } from '@/api/material/exports';
import { getAllUsers, User } from '@/api/users';
import { buildUserLookup, resolveChangedByAuthor } from '@/utils/userDisplayName';

export interface MaterialHistoryStats {
  recentChanges: MaterialHistoryWithMaterial[];
  allChanges: MaterialHistoryWithMaterial[];
  loading: boolean;
  error: string | null;
  resolveAuthor: (changedBy: string) => { name: string; login: string | null };
}

export function useMaterialHistory() {
  const [stats, setStats] = useState<Omit<MaterialHistoryStats, 'resolveAuthor'>>({
    recentChanges: [],
    allChanges: [],
    loading: true,
    error: null,
  });
  const [users, setUsers] = useState<User[]>([]);

  const userLookup = useMemo(() => buildUserLookup(users), [users]);

  const resolveAuthor = useCallback(
    (changedBy: string) => resolveChangedByAuthor(changedBy, userLookup),
    [userLookup]
  );

  useEffect(() => {
    const fetchMaterialHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        setStats((prev) => ({ ...prev, loading: true, error: null }));

        const [historyResponse, usersList] = await Promise.all([
          getMaterialHistoryList(token, { page: 1, limit: 100 }),
          getAllUsers(token).catch(() => []),
        ]);

        setUsers(usersList);

        const allChanges = historyResponse.data || [];
        const recentChanges = allChanges.slice(0, 4);

        setStats({
          recentChanges,
          allChanges,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        }));
      }
    };

    fetchMaterialHistory();
  }, []);

  return {
    ...stats,
    resolveAuthor,
  };
}
