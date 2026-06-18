'use client';

import { useEffect } from 'react';
import { workPricesApi } from '@/api/workPrices';
import { useWorkPricesStore } from '@/store/useWorkPricesStore';

let hasLoadedWorkPrices = false;

export function useWorkPricesBootstrap() {
  const setAll = useWorkPricesStore((state) => state.setAll);

  useEffect(() => {
    if (hasLoadedWorkPrices) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    hasLoadedWorkPrices = true;
    workPricesApi
      .getSettings()
      .then(setAll)
      .catch((error) => {
        hasLoadedWorkPrices = false;
        console.error('Не удалось загрузить настройки цен работ:', error);
      });
  }, [setAll]);
}
