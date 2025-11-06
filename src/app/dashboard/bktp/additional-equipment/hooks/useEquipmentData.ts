import { useState, useEffect } from 'react';
import { getCalculationsByGroup, type Calculation } from '@/api/calculations';
import { EquipmentConfig } from '../config/equipmentConfig';

interface UseEquipmentDataProps {
  config: EquipmentConfig;
}

export function useEquipmentData({ config }: UseEquipmentDataProps = { config: {} as EquipmentConfig }) {
  const [calculations, setCalculations] = useState<Calculation[] | null>(null);
  const [loading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log(`🚀 Начинаем загрузку для ${config.id}`);
      setLocalLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен не найден. Требуется авторизация.');
        }

        const groupSlug = 'shkafy-dlya-dop-komplektacii';
        const data = await getCalculationsByGroup(groupSlug, token);
        
        // Фильтруем данные по конфигурации
        let filteredData = data.filter(config.filterFn);
        
        // Применяем сортировку если есть
        if (config.sortFn && filteredData.length > 0) {
          filteredData = filteredData.sort(config.sortFn);
        }
        
        console.log(`🔍 Загруженные данные для ${config.id}:`, filteredData);
        setCalculations(filteredData);
      } catch (err) {
        console.error(`Error fetching ${config.id} data:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        console.log(`✅ Завершена загрузка для ${config.id}`);
        setLocalLoading(false);
      }
    };

    fetchData();
  }, [config]);

  return { calculations, loading, error };
}