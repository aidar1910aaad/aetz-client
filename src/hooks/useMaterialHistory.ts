import { useState, useEffect } from 'react';
import { getMaterialHistoryList, MaterialHistoryWithMaterial } from '@/api/material/exports';

export interface MaterialHistoryStats {
  recentChanges: MaterialHistoryWithMaterial[];
  loading: boolean;
  error: string | null;
}

export function useMaterialHistory() {
  const [stats, setStats] = useState<MaterialHistoryStats>({
    recentChanges: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchMaterialHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Получаем последние 4 изменения материалов через новый API
        const historyResponse = await getMaterialHistoryList(token);
        
        // Берем только первые 4 изменения
        const recentChanges = (historyResponse.data || []).slice(0, 4);

        setStats({
          recentChanges: recentChanges,
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

