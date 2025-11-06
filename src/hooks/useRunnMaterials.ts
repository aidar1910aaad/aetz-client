import { useState, useEffect } from 'react';
import { getSettings } from '@/api/settings';
import { getMaterialsByCategoryId, Material } from '@/api/material';
import { getAllCategories, Category } from '@/api/categories';

interface RunnSetting {
  type: string;
  isVisible: boolean;
  categoryId: number;
}

interface RunnMaterials {
  avtomatVyk: Material[];
  avtomatLity: Material[];
  counter: Material[];
  rpsLeft: Material[];
  fusesPn: Material[];
  currentTransformer: Material[];
  moldedCaseSwitch: Material[];
}

export function useRunnMaterials() {
  const [materials, setMaterials] = useState<RunnMaterials>({
    avtomatVyk: [],
    avtomatLity: [],
    counter: [],
    rpsLeft: [],
    fusesPn: [],
    currentTransformer: [],
    moldedCaseSwitch: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token') || '';
        if (!token) {
          throw new Error('Токен не найден');
        }

        // Получаем настройки RUNN
        const settingsResponse = await getSettings(token);
        const runnSettings = settingsResponse.settings.runn as RunnSetting[];


        if (!runnSettings || runnSettings.length === 0) {
          setLoading(false);
          return;
        }

        // Получаем все категории для поиска по названию
        const allCategories = await getAllCategories(token);

        // Группируем настройки по типам
        const settingsByType = {
          avtomatVyk: runnSettings.filter(s => s.type === 'avtomatVyk' && s.isVisible),
          avtomatLity: runnSettings.filter(s => s.type === 'avtomatLity' && s.isVisible),
          counter: runnSettings.filter(s => s.type === 'counter' && s.isVisible),
          rpsLeft: runnSettings.filter(s => s.type === 'rpsLeft' && s.isVisible),
          fusesPn: runnSettings.filter(s => s.type === 'fusesPn' && s.isVisible),
          currentTransformer: runnSettings.filter(s => s.type === 'currentTransformer' && s.isVisible),
          moldedCaseSwitch: runnSettings.filter(s => s.type === 'moldedCaseSwitch' && s.isVisible),
        };


        // Загружаем материалы для каждого типа
        const materialPromises = Object.entries(settingsByType).map(async ([type, settings]) => {
          if (settings.length === 0) {
            return { type, materials: [] };
          }

          // Собираем все материалы из всех категорий этого типа
          const allMaterials: Material[] = [];
          
          for (const setting of settings) {
            try {
              const categoryMaterials = await getMaterialsByCategoryId(setting.categoryId, token);
              allMaterials.push(...categoryMaterials);
              
            } catch (error) {
              console.error(`❌ RUNN Materials - Ошибка загрузки материалов для ${type}, categoryId: ${setting.categoryId}:`, error);
            }
          }

          return { type, materials: allMaterials };
        });

        const materialResults = await Promise.all(materialPromises);

        // Формируем итоговый объект материалов
        const newMaterials: RunnMaterials = {
          avtomatVyk: [],
          avtomatLity: [],
          counter: [],
          rpsLeft: [],
          fusesPn: [],
          currentTransformer: [],
          moldedCaseSwitch: [],
        };

        materialResults.forEach(({ type, materials }) => {
          if (type in newMaterials) {
            (newMaterials as any)[type] = materials;
          }
        });

        // Логирование трансформаторов тока из категории материалов
        if (newMaterials.currentTransformer.length > 0) {
          console.log('=== Все трансформаторы тока из категории материалов ===', newMaterials.currentTransformer);
        } else {
          console.log('=== Трансформаторы тока: не найдены ===');
        }

        setMaterials(newMaterials);
      } catch (error) {
        console.error('❌ RUNN Materials - Ошибка загрузки материалов:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Неизвестная ошибка',
          timestamp: new Date().toISOString()
        });
        setError(error instanceof Error ? error.message : 'Ошибка загрузки материалов');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  return {
    materials,
    loading,
    error,
  };
}