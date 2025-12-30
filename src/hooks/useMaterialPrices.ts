import { useState, useEffect } from 'react';
import { getMaterialById } from '@/api/material';

interface MaterialPrices {
  aluminum: number;
  copper: number;
  loading: boolean;
  error: string | null;
}

export function useMaterialPrices() {
  const [prices, setPrices] = useState<MaterialPrices>({
    aluminum: 2800, // Значение по умолчанию
    copper: 5600,   // Значение по умолчанию
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchMaterialPrices = async () => {
      try {
        setPrices(prev => ({ ...prev, loading: true, error: null }));
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен авторизации не найден');
        }

        // Загружаем алюминий (ID: 3489) и медь (ID: 3490)
        const [aluminumMaterial, copperMaterial] = await Promise.all([
          getMaterialById(3489, token),
          getMaterialById(3490, token)
        ]);

        setPrices({
          aluminum: typeof aluminumMaterial.price === 'string'
            ? parseFloat(aluminumMaterial.price)
            : aluminumMaterial.price,
          copper: typeof copperMaterial.price === 'string'
            ? parseFloat(copperMaterial.price)
            : copperMaterial.price,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Ошибка при загрузке цен материалов:', error);
        setPrices(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки цен'
        }));
      }
    };

    fetchMaterialPrices();
  }, []);

  return prices;
}








