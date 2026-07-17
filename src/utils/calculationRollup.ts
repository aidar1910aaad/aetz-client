export interface CalculationRates {
  hourlyRate: number;
  manufacturingHours?: number;
  overheadPercentage: number;
  adminPercentage: number;
  plannedProfitPercentage: number;
  ndsPercentage: number;
}

export interface CalculationRollupResult {
  materialsTotal: number;
  salary: number;
  overheadCost: number;
  productionCost: number;
  adminCost: number;
  fullCost: number;
  plannedProfit: number;
  wholesalePrice: number;
  ndsAmount: number;
  finalPrice: number;
}

export interface CalculationCategoryLike {
  items?: Array<{
    price?: number;
    quantity?: number;
  }>;
}

export interface CalculationLike {
  data?: {
    categories?: CalculationCategoryLike[];
    calculation?: Partial<CalculationRates>;
  };
}

export const DEFAULT_CALCULATION_RATES: CalculationRates = {
  hourlyRate: 1000,
  manufacturingHours: 4,
  overheadPercentage: 15,
  adminPercentage: 10,
  plannedProfitPercentage: 20,
  ndsPercentage: 12,
};

export function normalizeCalculationRates(
  rates?: Partial<CalculationRates>,
  defaults: CalculationRates = DEFAULT_CALCULATION_RATES
): CalculationRates {
  return {
    hourlyRate: rates?.hourlyRate ?? defaults.hourlyRate,
    manufacturingHours: rates?.manufacturingHours ?? defaults.manufacturingHours,
    overheadPercentage: rates?.overheadPercentage ?? defaults.overheadPercentage,
    adminPercentage: rates?.adminPercentage ?? defaults.adminPercentage,
    plannedProfitPercentage: rates?.plannedProfitPercentage ?? defaults.plannedProfitPercentage,
    ndsPercentage: rates?.ndsPercentage ?? defaults.ndsPercentage,
  };
}

export function sumCalculationCategories(categories?: CalculationCategoryLike[]): number {
  if (!Array.isArray(categories)) return 0;

  return categories.reduce((total, category) => {
    const itemsTotal = (category.items || []).reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);
    return total + itemsTotal;
  }, 0);
}

export function calculateRollup(
  materialsTotal: number,
  rates: CalculationRates,
  additionalMaterialsTotal = 0
): CalculationRollupResult {
  const totalMaterials = materialsTotal + additionalMaterialsTotal;
  const salary =
    rates.hourlyRate *
    (rates.manufacturingHours !== undefined && rates.manufacturingHours !== null
      ? rates.manufacturingHours
      : 4);
  const overheadCost = (totalMaterials * rates.overheadPercentage) / 100;
  const productionCost = totalMaterials + salary + overheadCost;
  const adminCost = (totalMaterials * rates.adminPercentage) / 100;
  const fullCost = productionCost + adminCost;
  const plannedProfit = (fullCost * rates.plannedProfitPercentage) / 100;
  const wholesalePrice = fullCost + plannedProfit;
  const ndsAmount = (wholesalePrice * rates.ndsPercentage) / 100;
  const finalPrice = wholesalePrice + ndsAmount;

  return {
    materialsTotal: totalMaterials,
    salary,
    overheadCost,
    productionCost,
    adminCost,
    fullCost,
    plannedProfit,
    wholesalePrice,
    ndsAmount,
    finalPrice,
  };
}

export function calculateCalculationFinalPrice(
  calculation: CalculationLike,
  additionalMaterialsTotal = 0,
  defaults: CalculationRates = DEFAULT_CALCULATION_RATES
): number {
  const materialsTotal = sumCalculationCategories(calculation.data?.categories);
  const rates = normalizeCalculationRates(calculation.data?.calculation, defaults);
  return calculateRollup(materialsTotal, rates, additionalMaterialsTotal).finalPrice;
}

export function calculateCalculationFinalPriceWithRates(
  calculation: CalculationLike,
  rates: CalculationRates,
  additionalMaterialsTotal = 0
): number {
  const materialsTotal = sumCalculationCategories(calculation.data?.categories);
  return calculateRollup(materialsTotal, rates, additionalMaterialsTotal).finalPrice;
}
