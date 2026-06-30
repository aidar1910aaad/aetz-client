import { useState, useEffect, useMemo } from 'react';
import { getSettings } from '@/api/settings';
import { getMaterialsByCategoryId } from '@/api/material';
import { Material } from '@/api/material';
import { useRusnStore } from '@/store/useRusnStore';
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

export function useRusnMaterials() {
  const { global } = useRusnStore();
  const [materials, setMaterials] = useState<RusnMaterialsState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryKey = useMemo(
    () =>
      [
        global.breaker?.id,
        global.rza?.id,
        global.meterType?.id,
        global.sr?.id,
        global.tsn?.id,
        global.tn?.id,
        global.tt?.id,
      ].join(':'),
    [
      global.breaker?.id,
      global.rza?.id,
      global.meterType?.id,
      global.sr?.id,
      global.tsn?.id,
      global.tn?.id,
      global.tt?.id,
    ]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token') || '';
        const settingsResponse = await getSettings(token);
        const rusnSettings = settingsResponse.settings.rusn as RusnSetting[];

        if (!rusnSettings?.length) {
          if (!cancelled) {
            setMaterials(EMPTY);
            setLoading(false);
          }
          return;
        }

        const switchSettings = rusnSettings.filter((s) => s.type === 'switch');
        const rzaSetting = rusnSettings.find((s) => s.type === 'rza');
        const counterSetting = rusnSettings.find((s) => s.type === 'counter');
        const transformerSetting = rusnSettings.find((s) => s.type === 'tn');
        const ttSetting = rusnSettings.find((s) => s.type === 'tt');
        const srSetting = rusnSettings.find((s) => s.type === 'sr');
        const tsnSetting = rusnSettings.find((s) => s.type === 'tsn');
        const tnSetting = rusnSettings.find((s) => s.type === 'tn');

        const validCategoryIds = {
          breaker:
            global.breaker?.id || (switchSettings.length > 0 ? switchSettings[0].categoryId : null),
          rza: global.rza?.id || rzaSetting?.categoryId || null,
          meter: global.meterType?.id || counterSetting?.categoryId || null,
          transformer: global.tn?.id || transformerSetting?.categoryId || null,
          sr: global.sr?.id || srSetting?.categoryId || null,
          tsn: global.tsn?.id || tsnSetting?.categoryId || null,
          tn: global.tn?.id || tnSetting?.categoryId || null,
          tt: global.tt?.id || ttSetting?.categoryId || null,
        };

        if (!switchSettings.length || !rzaSetting || !counterSetting) {
          if (!cancelled) {
            setMaterials(EMPTY);
            setLoading(false);
          }
          return;
        }

        const ids = Object.values(validCategoryIds)
          .filter(Boolean)
          .sort((a, b) => Number(a) - Number(b))
          .join(',');
        const cacheKey = `rusn:${categoryKey}:${ids}`;

        const result = await fetchWithDedup(rusnMaterialsSlot, cacheKey, async () => {
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
            validCategoryIds.breaker
              ? getMaterialsByCategoryId(validCategoryIds.breaker, token).catch(() => [])
              : Promise.resolve([]),
            validCategoryIds.rza
              ? getMaterialsByCategoryId(validCategoryIds.rza, token).catch(() => [])
              : Promise.resolve([]),
            validCategoryIds.meter
              ? getMaterialsByCategoryId(validCategoryIds.meter, token).catch(() => [])
              : Promise.resolve([]),
            validCategoryIds.transformer
              ? getMaterialsByCategoryId(validCategoryIds.transformer, token).catch(() => [])
              : Promise.resolve([]),
            validCategoryIds.sr
              ? getMaterialsByCategoryId(validCategoryIds.sr, token).catch(() => [])
              : Promise.resolve([]),
            validCategoryIds.tsn
              ? getMaterialsByCategoryId(validCategoryIds.tsn, token).catch(() => [])
              : Promise.resolve([]),
            validCategoryIds.tn
              ? getMaterialsByCategoryId(validCategoryIds.tn, token).catch(() => [])
              : Promise.resolve([]),
            validCategoryIds.tt
              ? getMaterialsByCategoryId(validCategoryIds.tt, token).catch(() => [])
              : Promise.resolve([]),
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
  }, [categoryKey]);

  return { materials, loading, error };
}
