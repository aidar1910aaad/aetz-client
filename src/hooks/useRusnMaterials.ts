import { useState, useEffect } from 'react';
import { getSettings } from '@/api/settings';
import { getMaterialsByCategoryId } from '@/api/material';
import { Material } from '@/api/material';
import { useRusnStore } from '@/store/useRusnStore';

interface RusnSetting {
  type: 'switch' | 'rza' | 'counter' | 'sr' | 'tsn' | 'tn';
  isVisible: boolean;
  categoryId: number;
}

export function useRusnMaterials() {
  const { global } = useRusnStore();
  const [materials, setMaterials] = useState<{
    breaker: Material[];
    rza: Material[];
    meter: Material[];
    transformer: Material[];
  }>({
    breaker: [],
    rza: [],
    meter: [],
    transformer: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token') || '';
        console.log('=== useRusnMaterials Hook ===');
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('Global settings:', {
          breaker: global.breaker,
          rza: global.rza,
          meterType: global.meterType,
        });

        // Получаем настройки
        const settingsResponse = await getSettings(token);
        const rusnSettings = settingsResponse.settings.rusn as RusnSetting[];

        if (!rusnSettings || rusnSettings.length === 0) {
          console.log('No RUSN settings found');
          setLoading(false);
          return;
        }

        // Находим нужные категории
        const switchSettings = rusnSettings.filter((s) => s.type === 'switch');
        const rzaSetting = rusnSettings.find((s) => s.type === 'rza');
        const counterSetting = rusnSettings.find((s) => s.type === 'counter');
        const transformerSetting = rusnSettings.find((s) => s.type === 'tn');

        console.log('RUSN Settings:', {
          switchSettings,
          rzaSetting,
          counterSetting,
          transformerSetting,
        });

        if (!switchSettings.length || !rzaSetting || !counterSetting) {
          console.log('Required category settings are missing');
          setLoading(false);
          return;
        }

        // Получаем материалы для каждой категории
        console.log('Fetching materials for categories...');
        try {
          // Validate category IDs before fetching
          const validCategoryIds = {
            breaker:
              global.breaker && !isNaN(Number(global.breaker)) ? Number(global.breaker) : null,
            rza: global.rza && !isNaN(Number(global.rza)) ? Number(global.rza) : null,
            meter:
              global.meterType && !isNaN(Number(global.meterType))
                ? Number(global.meterType)
                : null,
            transformer: transformerSetting?.categoryId || null,
          };

          console.log('Valid category IDs:', validCategoryIds);

          // Получаем материалы только для выбранных категорий
          const [breakerMaterials, rzaMaterials, meterMaterials, transformerMaterials] =
            await Promise.all([
              // Получаем материалы для выбранного выключателя
              validCategoryIds.breaker
                ? getMaterialsByCategoryId(validCategoryIds.breaker, token).catch((err) => {
                    console.warn(
                      `Warning: Could not fetch breaker materials for category ${validCategoryIds.breaker}:`,
                      err.message
                    );
                    return [];
                  })
                : Promise.resolve([]),

              // Получаем материалы для выбранной РЗА
              validCategoryIds.rza
                ? getMaterialsByCategoryId(validCategoryIds.rza, token).catch((err) => {
                    console.warn(
                      `Warning: Could not fetch rza materials for category ${validCategoryIds.rza}:`,
                      err.message
                    );
                    return [];
                  })
                : Promise.resolve([]),

              // Получаем материалы для выбранного счетчика
              validCategoryIds.meter
                ? getMaterialsByCategoryId(validCategoryIds.meter, token).catch((err) => {
                    console.warn(
                      `Warning: Could not fetch meter materials for category ${validCategoryIds.meter}:`,
                      err.message
                    );
                    return [];
                  })
                : Promise.resolve([]),

              // Получаем материалы для трансформаторов, если есть настройка
              validCategoryIds.transformer
                ? getMaterialsByCategoryId(validCategoryIds.transformer, token).catch((err) => {
                    console.warn('Warning: Could not fetch transformer materials:', err.message);
                    return [];
                  })
                : Promise.resolve([]),
            ]);

          console.log('Materials fetched:', {
            breaker: breakerMaterials,
            rza: rzaMaterials,
            meter: meterMaterials,
            transformer: transformerMaterials,
          });

          setMaterials({
            breaker: breakerMaterials,
            rza: rzaMaterials,
            meter: meterMaterials,
            transformer: transformerMaterials,
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
