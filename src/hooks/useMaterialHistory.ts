import { useState, useEffect } from 'react';
import { getMaterialHistoryList, MaterialHistoryWithMaterial } from '@/api/material/exports';

export interface MaterialHistoryStats {
  recentChanges: MaterialHistoryWithMaterial[];
  allChanges: MaterialHistoryWithMaterial[]; // Все изменения для фильтрации
  loading: boolean;
  error: string | null;
}

export function useMaterialHistory() {
  const [stats, setStats] = useState<MaterialHistoryStats>({
    recentChanges: [],
    allChanges: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchMaterialHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Получаем все изменения материалов через новый API
        const historyResponse = await getMaterialHistoryList(token, { page: 1, limit: 100 });
        
        const allChanges = historyResponse.data || [];
        // Берем только первые 4 изменения для отображения по умолчанию
        const recentChanges = allChanges.slice(0, 4);

        setStats({
          recentChanges: recentChanges,
          allChanges: allChanges,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        }));
      }
    };

    fetchMaterialHistory();
  }, []);

  return stats;
}

