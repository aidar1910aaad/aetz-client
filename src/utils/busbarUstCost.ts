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

export function isUst04CalculationName(name: string): boolean {
  return name.includes('0.4кВ') || name.includes('УСТ-0.4кВ');
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
