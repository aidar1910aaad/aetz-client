import { useState, useEffect } from 'react';
import { getMaterialById } from '@/api/material';
import {
  BUSBAR_UST_FALLBACK_PRICE_PER_KG,
  BUSBAR_UST_MATERIAL_IDS,
} from '@/utils/busbarUstCost';

interface MaterialPrices {
  aluminum: number;
  copper: number;
  loading: boolean;
  error: string | null;
}

export function useMaterialPrices() {
  const [prices, setPrices] = useState<MaterialPrices>({
    aluminum: BUSBAR_UST_FALLBACK_PRICE_PER_KG.aluminum,
    copper: BUSBAR_UST_FALLBACK_PRICE_PER_KG.copper,
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

        const [aluminumMaterial, copperMaterial] = await Promise.all([
          getMaterialById(BUSBAR_UST_MATERIAL_IDS.aluminum, token),
          getMaterialById(BUSBAR_UST_MATERIAL_IDS.copper, token),
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








