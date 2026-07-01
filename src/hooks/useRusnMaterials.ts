import { useState, useEffect } from 'react';
import { getSettings } from '@/api/settings/index';
import { getMaterialsByCategoryId } from '@/api/material';
import { Material } from '@/api/material';
import { fetchWithDedup, invalidateCacheSlot } from '@/lib/materialsFetchCache';

interface RusnSetting {
  type: 'switch' | 'rza' | 'counter' | 'sr' | 'tsn' | 'tn' | 'tt';
  isVisible: boolean;
  categoryId: number;
}

type RusnMaterialsState = {
  breaker: Material[];
  rza: Material[];
  meter: Material[];
  transformer: Material[];
  sr: Material[];
  tsn: Material[];
  tn: Material[];
  tt: Material[];
};

const EMPTY: RusnMaterialsState = {
  breaker: [],
  rza: [],
  meter: [],
  transformer: [],
  sr: [],
  tsn: [],
  tn: [],
  tt: [],
};

const rusnMaterialsSlot: {
  key: string;
  data: RusnMaterialsState | null;
  promise: Promise<RusnMaterialsState> | null;
  updatedAt: number;
} = { key: '', data: null, promise: null, updatedAt: 0 };

export function invalidateRusnMaterialsCache(): void {
  invalidateCacheSlot(rusnMaterialsSlot);
}

function buildSettingsCacheKey(settings: RusnSetting[]): string {
  return settings
    .filter((s) => s.isVisible)
    .map((s) => `${s.type}:${s.categoryId}`)
    .sort()
    .join('|');
}

async function loadMaterialsBySettingType(
  settings: RusnSetting[],
  type: RusnSetting['type'],
  token: string
): Promise<Material[]> {
  const categoryIds = [
    ...new Set(
      settings.filter((s) => s.type === type && s.isVisible).map((s) => s.categoryId)
    ),
  ];

  const materials: Material[] = [];
  for (const categoryId of categoryIds) {
    try {
      materials.push(...(await getMaterialsByCategoryId(categoryId, token)));
    } catch (error) {
      console.error(`RUSN Materials — ошибка categoryId ${categoryId} (${type}):`, error);
    }
  }

  return materials;
}

export function useRusnMaterials() {
  const [materials, setMaterials] = useState<RusnMaterialsState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token') || '';
        const settingsResponse = await getSettings(token);
        if (!settingsResponse?.settings?.rusn) {
          if (!cancelled) {
            setMaterials(EMPTY);
            setLoading(false);
          }
          return;
        }

        const rusnSettings = settingsResponse.settings.rusn as RusnSetting[];
        const visibleSettings = rusnSettings.filter((s) => s.isVisible);
        const cacheKey = buildSettingsCacheKey(rusnSettings);

        const hasRequiredCategories =
          visibleSettings.some((s) => s.type === 'switch') &&
          visibleSettings.some((s) => s.type === 'rza') &&
          visibleSettings.some((s) => s.type === 'counter');

        if (!hasRequiredCategories) {
          if (!cancelled) {
            setMaterials(EMPTY);
            setLoading(false);
          }
          return;
        }

        const result = await fetchWithDedup(rusnMaterialsSlot, `rusn:${cacheKey}`, async () => {
          const [
            breakerMaterials,
            rzaMaterials,
            meterMaterials,
            transformerMaterials,
            srMaterials,
            tsnMaterials,
            tnMaterials,
            ttMaterials,
          ] = await Promise.all([
            loadMaterialsBySettingType(visibleSettings, 'switch', token),
            loadMaterialsBySettingType(visibleSettings, 'rza', token),
            loadMaterialsBySettingType(visibleSettings, 'counter', token),
            loadMaterialsBySettingType(visibleSettings, 'tn', token),
            loadMaterialsBySettingType(visibleSettings, 'sr', token),
            loadMaterialsBySettingType(visibleSettings, 'tsn', token),
            loadMaterialsBySettingType(visibleSettings, 'tn', token),
            loadMaterialsBySettingType(visibleSettings, 'tt', token),
          ]);

          return {
            breaker: breakerMaterials,
            rza: rzaMaterials,
            meter: meterMaterials,
            transformer: transformerMaterials,
            sr: srMaterials,
            tsn: tsnMaterials,
            tn: tnMaterials,
            tt: ttMaterials,
          };
        });

        if (!cancelled) {
          setMaterials(result);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error in useRusnMaterials:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch materials');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMaterials();
    return () => {
      cancelled = true;
    };
  }, []);

  return { materials, loading, error };
}
