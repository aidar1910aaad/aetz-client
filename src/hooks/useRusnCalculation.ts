import { useState, useEffect } from 'react';
import { api } from '@/api/baseUrl';
import { currencyApi } from '@/api/currency';
import {
  calculateCalculationFinalPriceWithRates,
  CalculationRates,
} from '@/utils/calculationRollup';
import {
  API_FALLBACK_CALCULATION_RATES,
  applyApiCalculationRates,
  currencySettingsToCalculationRates,
} from '@/utils/calculationSettings';
import { fetchWithDedup } from '@/lib/materialsFetchCache';

export interface CalculationItem {
  id: number | null;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

export interface CalculationCategory {
  name: string;
  items: CalculationItem[];
}

export interface Calculation {
  id: number;
  name: string;
  slug: string;
  data: {
    categories: CalculationCategory[];
    calculation?: {
      manufacturingHours?: number;
      hourlyRate?: number;
      overheadPercentage?: number;
      adminPercentage?: number;
      plannedProfitPercentage?: number;
      ndsPercentage?: number;
    };
    cellConfig?: {
      type?: string;
      rzaCellTargets?: string[];
      materials?: Record<string, unknown>;
    };
  };
}

export interface CalculationState {
  breaker: Calculation[];
  rza: Calculation[];
  meter: Calculation[];
  cell: Calculation[];
}

interface RusnCalculationPayload {
  calculations: Calculation[];
  settingsRates: CalculationRates;
}

const EMPTY_CALCULATION_STATE: CalculationState = {
  breaker: [],
  rza: [],
  meter: [],
  cell: [],
};

const rusnCalculationSlot: {
  key: string;
  data: RusnCalculationPayload | null;
  promise: Promise<RusnCalculationPayload> | null;
  updatedAt: number;
} = { key: '', data: null, promise: null, updatedAt: 0 };

export function useRusnCalculation(groupSlug?: string) {
  const [calculations, setCalculations] = useState<CalculationState>(EMPTY_CALCULATION_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsRates, setSettingsRates] = useState<CalculationRates>(
    API_FALLBACK_CALCULATION_RATES
  );

  useEffect(() => {
    const fetchCalculations = async () => {
      
      if (!groupSlug) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token') || '';
        const payload = await fetchWithDedup(rusnCalculationSlot, groupSlug, async () => {
          const url = `${api}/calculations/groups/${groupSlug}/calculations`;
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(
              `Failed to fetch calculations: ${response.status} ${response.statusText}`
            );
          }

          const [data, settings] = await Promise.all([
            response.json() as Promise<Calculation[]>,
            currencyApi.getSettings().catch(() => null),
          ]);

          return {
            calculations: data,
            settingsRates: settings
              ? currencySettingsToCalculationRates(settings)
              : API_FALLBACK_CALCULATION_RATES,
          };
        });

        setSettingsRates(payload.settingsRates);

        // Группируем расчеты по типам
        const groupedCalculations: CalculationState = {
          breaker: [],
          rza: [],
          meter: [],
          cell: payload.calculations, // Все калькуляции ячеек
        };

        setCalculations(groupedCalculations);
      } catch (error) {
        console.error('❌ Error fetching calculations:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch calculations');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculations();
  }, [groupSlug]);

  const calculateCellTotal = (calculationId: number) => {
    const calculation = calculations.cell.find((c) => c.id === calculationId);
    if (!calculation) return 0;

    const calculationData = applyApiCalculationRates(calculation.data.calculation, settingsRates);
    return calculateCalculationFinalPriceWithRates(calculation, calculationData);
  };

  return {
    calculations,
    loading,
    error,
    calculateCellTotal,
    settingsRates,
  };
}
