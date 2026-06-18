import { getCalculationsByGroup, Calculation } from '@/api/calculations';
import { currencyApi } from '@/api/currency';
import { fetchWithDedup } from '@/lib/materialsFetchCache';
import {
  API_FALLBACK_CALCULATION_RATES,
  applyApiCalculationRates,
  currencySettingsToCalculationRates,
} from '@/utils/calculationSettings';
import { RUNN_CALCULATION_GROUP_SLUG } from './runnConstants';

const runnCalculationSlot: {
  key: string;
  data: Calculation[] | null;
  promise: Promise<Calculation[]> | null;
  updatedAt: number;
} = { key: '', data: null, promise: null, updatedAt: 0 };

export function loadRunnPanelCalculations(token?: string): Promise<Calculation[]> {
  const authToken = token ?? localStorage.getItem('token') ?? '';
  return fetchWithDedup(runnCalculationSlot, RUNN_CALCULATION_GROUP_SLUG, () =>
    Promise.all([
      getCalculationsByGroup(RUNN_CALCULATION_GROUP_SLUG, authToken),
      currencyApi.getSettings().catch(() => null),
    ]).then(([calculations, settings]) => {
      const settingsRates = settings
        ? currencySettingsToCalculationRates(settings)
        : API_FALLBACK_CALCULATION_RATES;

      return calculations.map((calculation) => ({
        ...calculation,
        data: {
          ...calculation.data,
          calculation: applyApiCalculationRates(calculation.data?.calculation, settingsRates),
        },
      }));
    })
  );
}
