import { useState, useEffect } from 'react';
import { getCalculationsByGroup, type Calculation } from '@/api/calculations';
import { EQUIPMENT_CONFIGS } from '../config/equipmentConfig';

interface EquipmentData {
  [key: string]: {
    calculations: Calculation[];
    loading: boolean;
    error: string | null;
  };
}

export function useAllEquipmentLoading() {
  const [equipmentData, setEquipmentData] = useState<EquipmentData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен не найден. Требуется авторизация.');
        }

        // Загружаем все данные одним запросом
        const groupSlug = 'shkafy-dlya-dop-komplektacii';
        const allData = await getCalculationsByGroup(groupSlug, token);
        
        // Инициализируем состояние для всех конфигураций
        const initialData: EquipmentData = {};
        
        // Обрабатываем каждую конфигурацию
        EQUIPMENT_CONFIGS.forEach(config => {
          let filteredData = allData.filter(config.filterFn);
          
          // Применяем сортировку если есть
          if (config.sortFn && filteredData.length > 0) {
            filteredData = filteredData.sort(config.sortFn);
          }
          
          initialData[config.id] = {
            calculations: filteredData,
            loading: false,
            error: null,
          };
        });
        
        setEquipmentData(initialData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { equipmentData, isLoading, error };
}