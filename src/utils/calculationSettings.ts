import { CurrencySettings } from '@/types/api/currency';
import { CalculationRates } from './calculationRollup';

export const API_FALLBACK_CALCULATION_RATES: CalculationRates = {
  hourlyRate: 2000,
  manufacturingHours: 4,
  overheadPercentage: 10,
  adminPercentage: 15,
  plannedProfitPercentage: 10,
  ndsPercentage: 12,
};

const toFiniteNumber = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function currencySettingsToCalculationRates(
  settings?: Partial<CurrencySettings> | null
): CalculationRates {
  return {
    hourlyRate: toFiniteNumber(settings?.hourlyWage, API_FALLBACK_CALCULATION_RATES.hourlyRate),
    manufacturingHours: API_FALLBACK_CALCULATION_RATES.manufacturingHours,
    overheadPercentage: toFiniteNumber(
      settings?.productionExpenses,
      API_FALLBACK_CALCULATION_RATES.overheadPercentage
    ),
    adminPercentage: toFiniteNumber(
      settings?.administrativeExpenses,
      API_FALLBACK_CALCULATION_RATES.adminPercentage
    ),
    plannedProfitPercentage: toFiniteNumber(
      settings?.plannedSavings,
      API_FALLBACK_CALCULATION_RATES.plannedProfitPercentage
    ),
    ndsPercentage: toFiniteNumber(settings?.vatRate, API_FALLBACK_CALCULATION_RATES.ndsPercentage),
  };
}

export function applyApiCalculationRates(
  calculationRates: Partial<CalculationRates> | undefined,
  apiRates: CalculationRates
): CalculationRates {
  return {
    hourlyRate: apiRates.hourlyRate,
    manufacturingHours: calculationRates?.manufacturingHours ?? apiRates.manufacturingHours,
    overheadPercentage: apiRates.overheadPercentage,
    adminPercentage: apiRates.adminPercentage,
    plannedProfitPercentage: apiRates.plannedProfitPercentage,
    ndsPercentage: apiRates.ndsPercentage,
  };
}
