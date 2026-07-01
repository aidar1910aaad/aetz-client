import { useState, useEffect } from 'react';
import { getMaterialsByCategoryId, Material } from '@/api/material';
import { fetchWithDedup, invalidateCacheSlot } from '@/lib/materialsFetchCache';
import {
  invalidateRunnCategoriesCache,
  loadRunnCategories,
} from '@/domain/runn/runnCategoriesLoader';

export interface RunnMaterials {
  avtomatVyk: Material[];
  avtomatLity: Material[];
  counter: Material[];
  rpsLeft: Material[];
  fusesPn: Material[];
  currentTransformer: Material[];
  moldedCaseSwitch: Material[];
}

export const EMPTY_RUNN_MATERIALS: RunnMaterials = {
  avtomatVyk: [],
  avtomatLity: [],
  counter: [],
  rpsLeft: [],
  fusesPn: [],
  currentTransformer: [],
  moldedCaseSwitch: [],
};

const runnMaterialsSlot: {
  key: string;
  data: RunnMaterials | null;
  promise: Promise<RunnMaterials> | null;
  updatedAt: number;
} = { key: '', data: null, promise: null, updatedAt: 0 };

async function loadRunnMaterialsFromApi(): Promise<RunnMaterials> {
  const token = localStorage.getItem('token') || '';
  if (!token) {
    throw new Error('Токен не найден');
  }

  const categories = await loadRunnCategories(token);
  const visibleSettings = Object.entries(categories).flatMap(([type, items]) =>
    items
      .filter((item) => item.visible)
      .map((item) => ({
        type,
        categoryId: Number(item.id),
        isVisible: true,
      }))
  );

  if (!visibleSettings.length) {
    return EMPTY_RUNN_MATERIALS;
  }

  const cacheKey = `runn:${visibleSettings
    .map((s) => `${s.type}:${s.categoryId}`)
    .sort()
    .join('|')}`;

  return fetchWithDedup(runnMaterialsSlot, cacheKey, async () => {
    const settingsByType = {
      avtomatVyk: visibleSettings.filter((s) => s.type === 'avtomatVyk'),
      avtomatLity: visibleSettings.filter((s) => s.type === 'avtomatLity'),
      counter: visibleSettings.filter((s) => s.type === 'counter'),
      rpsLeft: visibleSettings.filter((s) => s.type === 'rpsLeft'),
      fusesPn: visibleSettings.filter((s) => s.type === 'fusesPn'),
      currentTransformer: visibleSettings.filter((s) => s.type === 'currentTransformer'),
      moldedCaseSwitch: visibleSettings.filter((s) => s.type === 'moldedCaseSwitch'),
    };

    const materialPromises = Object.entries(settingsByType).map(async ([type, settings]) => {
      if (settings.length === 0) {
        return { type, materials: [] as Material[] };
      }

      const allMaterials: Material[] = [];
      for (const setting of settings) {
        try {
          const categoryMaterials = await getMaterialsByCategoryId(setting.categoryId, token);
          allMaterials.push(...categoryMaterials);
        } catch (error) {
          console.error(
            `RUNN Materials — ошибка categoryId ${setting.categoryId} (${type}):`,
            error
          );
        }
      }
      return { type, materials: allMaterials };
    });

    const materialResults = await Promise.all(materialPromises);
    const newMaterials: RunnMaterials = { ...EMPTY_RUNN_MATERIALS };

    materialResults.forEach(({ type, materials }) => {
      if (type in newMaterials) {
        (newMaterials as unknown as Record<string, Material[]>)[type] = materials;
      }
    });

    return newMaterials;
  });
}

export function invalidateRunnMaterialsCache(): void {
  invalidateCacheSlot(runnMaterialsSlot);
  invalidateRunnCategoriesCache();
}

export function useRunnMaterials() {
  const [materials, setMaterials] = useState<RunnMaterials>(EMPTY_RUNN_MATERIALS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadRunnMaterialsFromApi();
        if (!cancelled) {
          setMaterials(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки материалов');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { materials, loading, error };
}
