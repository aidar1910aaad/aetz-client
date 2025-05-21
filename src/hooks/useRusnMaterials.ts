import { useState, useEffect } from 'react';
import { getSettings } from '@/api/settings';
import { getMaterialsByCategoryId } from '@/api/material';
import { Material } from '@/api/material';
import { useRusnStore } from '@/store/useRusnStore';

export function useRusnMaterials() {
  const { global } = useRusnStore();
  const [materials, setMaterials] = useState<{
    breaker: Material[];
    rza: Material[];
    meter: Material[];
    ctRatio: Material[];
  }>({
    breaker: [],
    rza: [],
    meter: [],
    ctRatio: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token') || '';
        console.log('Token:', token ? 'Present' : 'Missing');
        
        // Получаем ID категорий из глобального состояния
        const breakerCategoryId = global.breaker ? parseInt(global.breaker) : null;
        const rzaCategoryId = global.rza ? parseInt(global.rza) : null;
        const meterCategoryId = global.meterType ? parseInt(global.meterType) : null;

        console.log('Category IDs from global state:', {
          breaker: breakerCategoryId,
          rza: rzaCategoryId,
          meter: meterCategoryId
        });

        if (!breakerCategoryId || !rzaCategoryId || !meterCategoryId) {
          console.log('Some category IDs are missing, skipping material fetch');
          setLoading(false);
          return;
        }

        // Получаем материалы для каждой категории
        console.log('Fetching materials for categories...');
        try {
          const [breakerMaterials, rzaMaterials, meterMaterials] = await Promise.all([
            getMaterialsByCategoryId(breakerCategoryId, token).catch(err => {
              console.error('Error fetching breaker materials:', err);
              return [];
            }),
            getMaterialsByCategoryId(rzaCategoryId, token).catch(err => {
              console.error('Error fetching rza materials:', err);
              return [];
            }),
            getMaterialsByCategoryId(meterCategoryId, token).catch(err => {
              console.error('Error fetching meter materials:', err);
              return [];
            })
          ]);

          console.log('Materials fetched:', {
            breaker: breakerMaterials,
            rza: rzaMaterials,
            meter: meterMaterials
          });

          setMaterials({
            breaker: breakerMaterials,
            rza: rzaMaterials,
            meter: meterMaterials,
            ctRatio: []
          });
        } catch (err) {
          console.error('Error fetching materials:', err);
          throw err;
        }
      } catch (err) {
        console.error('Error in useRusnMaterials:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch materials');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [global.breaker, global.rza, global.meterType]);

  return { materials, loading, error };
} 