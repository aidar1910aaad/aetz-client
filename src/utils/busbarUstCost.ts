export const BUSBAR_UST_MATERIAL_IDS = {
  aluminum: 3489,
  copper: 3490,
} as const;

export const BUSBAR_UST_FALLBACK_PRICE_PER_KG = {
  aluminum: 2800,
  copper: 5600,
} as const;

export interface BusbarUstData {
  mainUstWeight: number;
  zeroUstWeight: number;
  material: string;
}

export interface BusbarMaterialPrices {
  aluminum: number;
  copper: number;
}

export interface UstSpecificationRow {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
}

export function isUst04CalculationName(name: string): boolean {
  const normalized = String(name || '')
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/\s+/g, '');
  return (
    normalized.includes('0.4кв') ||
    normalized.includes('уст-0.4кв') ||
    normalized.includes('уст-0-4кв')
  );
}

/** УСТ по стороне ВН (10кВ / 20кВ), без путаницы с УСТ-0.4кВ */
export function findUstCalculationByVoltage(
  calculations: Array<{ name?: string; slug?: string }>,
  voltage: string | number | null | undefined
): (typeof calculations)[number] | undefined {
  if (voltage == null || String(voltage).trim() === '') return undefined;
  const volts = String(voltage).replace(/[^\d]/g, '');
  if (!volts) return undefined;

  return calculations.find((calc) => {
    const name = String(calc.name || '');
    const slug = String(calc.slug || '').toLowerCase();
    if (isUst04CalculationName(name) || isUst04CalculationName(slug)) return false;
    return (
      name.includes(`УСТ-${volts}кВ`) ||
      name.includes(`${volts}кВ`) ||
      slug.includes(`уст-${volts}`) ||
      slug.includes(`${volts}кв`)
    );
  });
}

export function findUst04Calculation(
  calculations: Array<{ name?: string; slug?: string }>
): (typeof calculations)[number] | undefined {
  return calculations.find(
    (calc) => isUst04CalculationName(String(calc.name || '')) || isUst04CalculationName(String(calc.slug || ''))
  );
}

export function isAluminumBusbarMaterial(material: string): boolean {
  return material === 'Алюминий' || material.includes('АД');
}

export function getBusbarPricePerKg(
  material: string,
  prices?: BusbarMaterialPrices | null
): number {
  const isAluminum = isAluminumBusbarMaterial(material);
  if (prices) {
    const value = isAluminum ? prices.aluminum : prices.copper;
    if (value > 0) return value;
  }
  return isAluminum
    ? BUSBAR_UST_FALLBACK_PRICE_PER_KG.aluminum
    : BUSBAR_UST_FALLBACK_PRICE_PER_KG.copper;
}

export function calculateBusbarUstCost(
  busbarUstData: BusbarUstData | null | undefined,
  prices?: BusbarMaterialPrices | null
): number {
  if (!busbarUstData) return 0;
  const weight =
    (Number(busbarUstData.mainUstWeight) || 0) + (Number(busbarUstData.zeroUstWeight) || 0);
  if (weight <= 0) return 0;
  return weight * getBusbarPricePerKg(busbarUstData.material, prices);
}

export function calculateUstPrice(calc: any, additionalUstCost = 0): number {
  if (!calc?.data?.categories) return 0;

  const materialsTotal = calc.data.categories.reduce(
    (categoriesTotal: number, category: any) =>
      categoriesTotal +
      (category.items || []).reduce(
        (itemsTotal: number, item: any) =>
          itemsTotal + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0,
      ),
    0,
  );
  const totalMaterialsWithUst = materialsTotal + additionalUstCost;
  const calculation = calc.data.calculation;
  if (!calculation) return totalMaterialsWithUst;

  const manufacturingCost =
    (Number(calculation.manufacturingHours) || 0) * (Number(calculation.hourlyRate) || 0);
  const overheadCost =
    totalMaterialsWithUst * ((Number(calculation.overheadPercentage) || 0) / 100);
  const productionCost = totalMaterialsWithUst + manufacturingCost + overheadCost;
  const adminCost =
    totalMaterialsWithUst * ((Number(calculation.adminPercentage) || 0) / 100);
  const fullCost = productionCost + adminCost;
  const profitCost =
    fullCost * ((Number(calculation.plannedProfitPercentage) || 0) / 100);
  const wholesalePrice = fullCost + profitCost;
  const vatCost = wholesalePrice * ((Number(calculation.ndsPercentage) || 0) / 100);
  return wholesalePrice + vatCost;
}

/**
 * Формирует строки УСТ для спецификации.
 * УСТ-0,4 кВ относится к РУНН, остальные УСТ — к РУСН.
 */
export function getTransformerUstRows(
  transformer: any,
  section: 'rusn' | 'runn',
  prices?: BusbarMaterialPrices | null,
): UstSpecificationRow[] {
  if (!transformer) return [];

  const calculations =
    Array.isArray(transformer.ustCalculations) && transformer.ustCalculations.length > 0
      ? transformer.ustCalculations
      : transformer.ustCalculation
        ? [transformer.ustCalculation]
        : [];
  const quantity = Number(transformer.quantity) || 2;
  const busbarCost = calculateBusbarUstCost(transformer.busbarUstData, prices);

  return calculations
    .filter((calc: any) => {
      const isRunn = isUst04CalculationName(calc?.name || calc?.slug || '');
      return section === 'runn' ? isRunn : !isRunn;
    })
    .map((calc: any, index: number) => {
      const isRunn = section === 'runn';
      const price = calculateUstPrice(calc, isRunn ? busbarCost : 0);
      return {
        id: `ust-${section}-${index + 1}`,
        name: calc.name || 'УСТ',
        unit: 'шт',
        quantity,
        price,
        total: price * quantity,
      };
    });
}
