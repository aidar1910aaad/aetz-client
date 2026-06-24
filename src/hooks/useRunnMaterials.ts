import { useState, useEffect } from 'react';
import { getSettings } from '@/api/settings';
import { getMaterialsByCategoryId, Material } from '@/api/material';
import { fetchWithDedup, invalidateCacheSlot } from '@/lib/materialsFetchCache';

interface RunnSetting {
  type: string;
  isVisible: boolean;
  categoryId: number;
}

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

  const settingsResponse = await getSettings(token);
  const runnSettings = settingsResponse.settings.runn as RunnSetting[];

  if (!runnSettings?.length) {
    return EMPTY_RUNN_MATERIALS;
  }

  const visible = runnSettings.filter((s) => s.isVisible);
  const cacheKey = `runn:${visible
    .map((s) => `${s.type}:${s.categoryId}`)
    .sort()
    .join('|')}`;

  return fetchWithDedup(runnMaterialsSlot, cacheKey, async () => {
    const settingsByType = {
      avtomatVyk: visible.filter((s) => s.type === 'avtomatVyk'),
      avtomatLity: visible.filter((s) => s.type === 'avtomatLity'),
      counter: visible.filter((s) => s.type === 'counter'),
      rpsLeft: visible.filter((s) => s.type === 'rpsLeft'),
      fusesPn: visible.filter((s) => s.type === 'fusesPn'),
      currentTransformer: visible.filter((s) => s.type === 'currentTransformer'),
      moldedCaseSwitch: visible.filter((s) => s.type === 'moldedCaseSwitch'),
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
