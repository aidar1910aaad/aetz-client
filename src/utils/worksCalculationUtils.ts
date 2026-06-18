import { defaultWorkPrices, type PriceKey, type WorkPricesValues } from '@/store/useWorkPricesStore';

// Утилиты для расчета работ с учетом API-настроек цен.

const price = (prices: WorkPricesValues, key: PriceKey) => Number(prices[key]) || 0;

// Backward-compatible exports for stale Fast Refresh chunks and older persisted code paths.
export const BMZ_PRICES = {
  installationUpTo6: defaultWorkPrices.bmzPriceUpTo6Blocks,
  installationOver6: defaultWorkPrices.bmzPriceOver6Blocks,
  externalGroundingUpTo6: defaultWorkPrices.bmzExternalGroundingPerMeter,
  externalGroundingOver6: defaultWorkPrices.bmzExternalGroundingPerMeter,
  internalGrounding: defaultWorkPrices.bmzInternalGroundingPerKit,
  cableRacks: defaultWorkPrices.bmzCableRacks,
};

export const RUSN_PRICES = {
  installationUpTo6: defaultWorkPrices.rusnPriceUpTo6Cells,
  installation6To8: defaultWorkPrices.rusnPrice6To8Cells,
  installationOver8: defaultWorkPrices.rusnPriceOver8Cells,
  busBridge: defaultWorkPrices.rusnBusBridgePrice,
  busBridgeInstallation: defaultWorkPrices.rusnBusBridgeInstallationPrice,
  transformerUnit: defaultWorkPrices.rusnTransformerUnitPrice,
};

export const TRANSFORMER_PRICES = {
  installation: defaultWorkPrices.transformerPrice1000,
};

export function calculateTieredCost(
  quantity: number,
  tiers: Array<{ limit?: number; price: number }>
): number {
  let remaining = Math.max(0, Number(quantity) || 0);
  let previousLimit = 0;
  let total = 0;

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const limit = tier.limit ?? Number.POSITIVE_INFINITY;
    const tierQuantity = Math.min(remaining, Math.max(limit - previousLimit, 0));
    total += tierQuantity * tier.price;
    remaining -= tierQuantity;
    previousLimit = limit;
  }

  return Math.round(total);
}

/**
 * Расчет стоимости монтажа БМЗ с учетом сложной логики
 */
export function calculateBmzInstallationCost(
  blockCount: number,
  prices: WorkPricesValues = defaultWorkPrices
): number {
  if (blockCount <= 0) return 0;

  return calculateTieredCost(blockCount, [
    { limit: 6, price: price(prices, 'bmzPriceUpTo6Blocks') },
    { price: price(prices, 'bmzPriceOver6Blocks') },
  ]);
}

/**
 * Расчет стоимости внешнего контура заземления БМЗ
 */
export function calculateBmzExternalGroundingLength(lengthMm: number, widthMm: number): number {
  if (lengthMm <= 0 || widthMm <= 0) return 0;
  return Math.round(((lengthMm + widthMm) * 2) / 1000 * 100) / 100;
}

export function calculateBmzExternalGroundingCost(
  lengthMm: number,
  widthMm: number,
  prices: WorkPricesValues = defaultWorkPrices
): number {
  return Math.round(
    calculateBmzExternalGroundingLength(lengthMm, widthMm) *
      price(prices, 'bmzExternalGroundingPerMeter')
  );
}

/**
 * Расчет стоимости монтажа РУСН с учетом сложной логики
 */
export function calculateRusnInstallationCost(
  cellCount: number,
  prices: WorkPricesValues = defaultWorkPrices
): number {
  if (cellCount <= 0) return 0;

  return calculateTieredCost(cellCount, [
    { limit: 6, price: price(prices, 'rusnPriceUpTo6Cells') },
    { limit: 8, price: price(prices, 'rusnPrice6To8Cells') },
    { price: price(prices, 'rusnPriceOver8Cells') },
  ]);
}

export function calculateRunnInstallationCost(
  panelCount: number,
  prices: WorkPricesValues = defaultWorkPrices
): number {
  if (panelCount <= 0) return 0;

  return calculateTieredCost(panelCount, [
    { limit: 7, price: price(prices, 'runnMountRu04UpTo7PerPanel') },
    { limit: 9, price: price(prices, 'runnMountRu048To9PerPanel') },
    { price: price(prices, 'runnMountRu04Over9PerPanel') },
  ]);
}

export function getTransformerInstallationPriceKey(power: number): PriceKey {
  if (power <= 630) return 'transformerPrice630';
  if (power <= 1600) return 'transformerPrice1000';
  return 'transformerPrice2500';
}

export function getTransformerInstallationPrice(
  power: number,
  prices: WorkPricesValues = defaultWorkPrices
): number {
  return price(prices, getTransformerInstallationPriceKey(power));
}

export function getRunnTransformerUnitPriceKey(summaryName?: string): PriceKey | null {
  const name = summaryName || '';
  const materialMatch = name.match(/шина\s+(МТ|АД)\s*([23])?/i);
  const sizeMatch = name.match(/10\s*[xх×]\s*(100|120|160)/i);
  if (!materialMatch || !sizeMatch) return null;

  const material = materialMatch[1].toLowerCase() === 'мт' ? 'Mt' : 'Ad';
  const multiplicity =
    materialMatch[2] === '3' ? 'Triple' : materialMatch[2] === '2' ? 'Double' : 'Single';

  return `runnUnit${material}10x${sizeMatch[1]}${multiplicity}` as PriceKey;
}

/**
 * Расчет средней цены за ячейку для РУСН
 */
export function calculateRusnAveragePricePerCell(
  cellCount: number,
  prices: WorkPricesValues = defaultWorkPrices
): number {
  if (cellCount <= 0) return 0;
  const totalCost = calculateRusnInstallationCost(cellCount, prices);
  return Math.round(totalCost / cellCount);
}

/**
 * Расчет средней цены за блок для БМЗ
 */
export function calculateBmzAveragePricePerBlock(
  blockCount: number,
  prices: WorkPricesValues = defaultWorkPrices
): number {
  if (blockCount <= 0) return 0;
  const totalCost = calculateBmzInstallationCost(blockCount, prices);
  return Math.round(totalCost / blockCount);
}

/**
 * Расчет средней цены за блок для внешнего контура заземления БМЗ
 */
export function calculateRunnAveragePricePerPanel(
  panelCount: number,
  prices: WorkPricesValues = defaultWorkPrices
): number {
  if (panelCount <= 0) return 0;
  const totalCost = calculateRunnInstallationCost(panelCount, prices);
  return Math.round(totalCost / panelCount);
}

export function calculateBmzExternalGroundingAveragePricePerBlock(
  blockCount: number,
  prices: WorkPricesValues = defaultWorkPrices
): number {
  if (blockCount <= 0) return 0;
  return Math.round(price(prices, 'bmzExternalGroundingPerMeter'));
}