import { Calculation } from '@/hooks/useRusnCalculation';
import {
  isBhaCalculationType,
  KSO_A12_BREAKER_CELL_CONFIG_TYPES,
  RUSN_CAMERA,
  RUSN_CELL_PURPOSE,
} from './rusnConstants';

function excludeBhaCalculations(calculations: Calculation[]): Calculation[] {
  return calculations.filter(
    (calc) => !isBhaCalculationType(calc.data?.cellConfig?.type)
  );
}

export interface RusnMaterialIds {
  breakerId?: string;
  rzaId?: string;
  disconnectorId?: string;
  puId?: string;
  tsnId?: string;
  tnId?: string;
}

export interface RusnResolvedCalculations {
  breakerCalculation?: Calculation | null;
  rzaCalculation?: Calculation | null;
  disconnectorCalculation?: Calculation | null;
  puCalculation?: Calculation | null;
  tsnCalculation?: Calculation | null;
  tnCalculation?: Calculation | null;
  cellType: string;
}

function asMaterialArray(value: unknown): Array<{ id?: string | number }> {
  if (!value) return [];
  return Array.isArray(value) ? value : [value as { id?: string | number }];
}

function matchesMaterialId(
  calc: Calculation,
  materialType: string,
  materialId: string
): boolean {
  if (isBhaCalculationType(calc.data?.cellConfig?.type)) return false;
  const materials = calc.data?.cellConfig?.materials?.[materialType];
  return asMaterialArray(materials).some(
    (material) => String(material.id) === String(materialId)
  );
}

function findByMaterialId(
  calculations: Calculation[],
  materialType: string,
  materialId?: string,
  preferredCellConfigTypes?: string[]
): Calculation | null {
  if (!materialId) return null;

  if (preferredCellConfigTypes?.length) {
    for (const configType of preferredCellConfigTypes) {
      const match = calculations.find(
        (calc) =>
          calc.data?.cellConfig?.type === configType &&
          matchesMaterialId(calc, materialType, materialId)
      );
      if (match) return match;
    }
    return null;
  }

  return (
    calculations.find((calc) => matchesMaterialId(calc, materialType, materialId)) || null
  );
}

function getKsoA12BreakerCellConfigTypes(cellPurpose: string): string[] | undefined {
  return KSO_A12_BREAKER_CELL_CONFIG_TYPES[cellPurpose];
}

export function resolveRusnCellCalculations(
  calculations: Calculation[],
  materialIds: RusnMaterialIds,
  cellPurpose: string,
  hasMeterType: boolean,
  bodyType?: string
): RusnResolvedCalculations {
  const materialCalculations = excludeBhaCalculations(calculations);
  const preferredBreakerCellConfigTypes =
    bodyType === RUSN_CAMERA.KSO_A12_10
      ? getKsoA12BreakerCellConfigTypes(cellPurpose)
      : undefined;

  const breakerCalculation = findByMaterialId(
    materialCalculations,
    'switch',
    materialIds.breakerId,
    preferredBreakerCellConfigTypes
  );
  const rzaCalculation = findByMaterialId(calculations, 'rza', materialIds.rzaId);
  const disconnectorCalculation = findByMaterialId(
    calculations,
    'disconnector',
    materialIds.disconnectorId
  );
  const puCalculation = findByMaterialId(calculations, 'pu', materialIds.puId);
  const tsnCalculation = findByMaterialId(calculations, 'tsn', materialIds.tsnId);
  const tnCalculation = findByMaterialId(calculations, 'tn', materialIds.tnId);

  let finalPuCalculation = puCalculation;
  if (!finalPuCalculation && materialIds.puId) {
    finalPuCalculation = calculations.find((calc) => calc.data?.cellConfig?.type === 'pu') || null;
  }

  let finalDisconnectorCalculation = disconnectorCalculation;
  if (!finalDisconnectorCalculation && materialIds.disconnectorId) {
    finalDisconnectorCalculation =
      calculations.find((calc) => calc.data?.cellConfig?.type === 'disconnector') || null;
  }

  let finalTnCalculation = tnCalculation;
  if (!finalTnCalculation && materialIds.tnId) {
    finalTnCalculation = calculations.find((calc) => calc.data?.cellConfig?.type === 'tn') || null;
  }
  if (!finalTnCalculation && cellPurpose === RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER) {
    finalTnCalculation = calculations.find((calc) => calc.data?.cellConfig?.type === 'tn') || null;
  }

  let finalTsnCalculation = tsnCalculation;
  if (!finalTsnCalculation && materialIds.tsnId) {
    finalTsnCalculation =
      calculations.find((calc) => calc.data?.cellConfig?.type === 'tsn') || null;
  }
  if (!finalTsnCalculation && cellPurpose === RUSN_CELL_PURPOSE.AUX_TRANSFORMER) {
    finalTsnCalculation =
      calculations.find((calc) => calc.data?.cellConfig?.type === 'tsn') || null;
  }

  let cellType = 'Выключатель';
  if (finalPuCalculation) {
    cellType = 'ПУ';
  } else if (finalDisconnectorCalculation) {
    cellType = 'Разъединитель';
  } else if (finalTsnCalculation) {
    cellType = 'ТСН';
  } else if (finalTnCalculation) {
    cellType = 'ТН';
  } else if (breakerCalculation) {
    cellType = 'Выключатель';
  }

  if (cellPurpose === RUSN_CELL_PURPOSE.SECTION_DISCONNECTOR) {
    cellType = 'Разъединитель';
  } else if (cellPurpose === RUSN_CELL_PURPOSE.AUX_TRANSFORMER) {
    cellType = 'ТСН';
  } else if (cellPurpose === RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER) {
    cellType = 'ТН';
  } else if (hasMeterType && !finalPuCalculation) {
    cellType = 'ПУ';
  } else if (
    cellPurpose === RUSN_CELL_PURPOSE.INPUT &&
    !finalPuCalculation &&
    !finalTsnCalculation &&
    !finalTnCalculation
  ) {
    cellType = 'Выключатель';
  }

  return {
    breakerCalculation,
    rzaCalculation,
    disconnectorCalculation: finalDisconnectorCalculation,
    puCalculation: finalPuCalculation,
    tsnCalculation: finalTsnCalculation,
    tnCalculation: finalTnCalculation,
    cellType,
  };
}
