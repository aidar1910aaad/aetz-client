// Утилиты для расчета работ с учетом сложной логики цен

// Цены для БМЗ
export const BMZ_PRICES = {
  installationUpTo6: 56595, // Цена за монтаж каждого блока до 6 блоков
  installationOver6: 43535, // Цена за монтаж каждого блока свыше 6 блоков
  externalGroundingUpTo6: 41358, // Внешний контур заземления до 6 блоков
  externalGroundingOver6: 28297, // Внешний контур заземления свыше 6 блоков
  internalGrounding: 87000, // Внутренний контур заземления
  cableRacks: 163260, // Монтаж кабельных стоек и полок
};

// Цены для РУСН
export const RUSN_PRICES = {
  installationUpTo6: 60948, // Монтаж РУ-10\20 кВ с ШРЗ до 6 ячеек
  installation6To8: 108840, // Свыше 6 ячеек до 8 ячеек
  installationOver8: 21770, // Каждая последующая добавленная свыше 8 ячеек
  busBridge: 100130, // Шинный мост монтаж и изготовление
  busBridgeInstallation: 25000, // Установка Шинного моста
  transformerUnit: 108840, // Узел силового трансформатора 10/20 кВ
};

// Цены для трансформаторов
export const TRANSFORMER_PRICES = {
  installation: 87070, // Монтаж трансформатора (Мощность 1000-1600 кВА)
};

/**
 * Расчет стоимости монтажа БМЗ с учетом сложной логики
 */
export function calculateBmzInstallationCost(blockCount: number): number {
  if (blockCount <= 0) return 0;
  
  if (blockCount <= 6) {
    return blockCount * BMZ_PRICES.installationUpTo6;
  } else {
    const costForFirst6 = 6 * BMZ_PRICES.installationUpTo6;
    const costForRemaining = (blockCount - 6) * BMZ_PRICES.installationOver6;
    return costForFirst6 + costForRemaining;
  }
}

/**
 * Расчет стоимости внешнего контура заземления БМЗ
 */
export function calculateBmzExternalGroundingCost(blockCount: number): number {
  if (blockCount <= 0) return 0;
  
  if (blockCount <= 6) {
    return blockCount * BMZ_PRICES.externalGroundingUpTo6;
  } else {
    const costForFirst6 = 6 * BMZ_PRICES.externalGroundingUpTo6;
    const costForRemaining = (blockCount - 6) * BMZ_PRICES.externalGroundingOver6;
    return costForFirst6 + costForRemaining;
  }
}

/**
 * Расчет стоимости монтажа РУСН с учетом сложной логики
 */
export function calculateRusnInstallationCost(cellCount: number): number {
  if (cellCount <= 0) return 0;
  
  if (cellCount <= 6) {
    return cellCount * RUSN_PRICES.installationUpTo6;
  } else if (cellCount <= 8) {
    const costForFirst6 = 6 * RUSN_PRICES.installationUpTo6;
    const costForRemaining = (cellCount - 6) * RUSN_PRICES.installation6To8;
    return costForFirst6 + costForRemaining;
  } else {
    const costForFirst6 = 6 * RUSN_PRICES.installationUpTo6;
    const costFor6To8 = 2 * RUSN_PRICES.installation6To8;
    const costForOver8 = (cellCount - 8) * RUSN_PRICES.installationOver8;
    return costForFirst6 + costFor6To8 + costForOver8;
  }
}

/**
 * Расчет средней цены за ячейку для РУСН
 */
export function calculateRusnAveragePricePerCell(cellCount: number): number {
  if (cellCount <= 0) return 0;
  const totalCost = calculateRusnInstallationCost(cellCount);
  return Math.round(totalCost / cellCount);
}

/**
 * Расчет средней цены за блок для БМЗ
 */
export function calculateBmzAveragePricePerBlock(blockCount: number): number {
  if (blockCount <= 0) return 0;
  const totalCost = calculateBmzInstallationCost(blockCount);
  return Math.round(totalCost / blockCount);
}

/**
 * Расчет средней цены за блок для внешнего контура заземления БМЗ
 */
export function calculateBmzExternalGroundingAveragePricePerBlock(blockCount: number): number {
  if (blockCount <= 0) return 0;
  const totalCost = calculateBmzExternalGroundingCost(blockCount);
  return Math.round(totalCost / blockCount);
}