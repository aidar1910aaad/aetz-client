import { Calculation } from '@/hooks/useRusnCalculation';
import {
  BREAKER_CELL_CONFIG_TYPE_PREFERENCES,
  isBhaCalculationType,
  RUSN_CAMERA,
  RUSN_CELL_PURPOSE,
  isVoltageTransformerCellPurpose,
} from './rusnConstants';
import { getRzaCellTargetForPurpose } from '@/domain/calculation/rzaCellTargets';
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
  materialId: string,
  alternateMaterialTypes: string[] = []
): boolean {
  if (isBhaCalculationType(calc.data?.cellConfig?.type)) return false;

  const typesToCheck = [materialType, ...alternateMaterialTypes];

  return typesToCheck.some((type) => {
    const materials = calc.data?.cellConfig?.materials?.[type];
    return asMaterialArray(materials).some(
      (material) => String(material.id) === String(materialId)
    );
  });
}

function findByMaterialId(
  calculations: Calculation[],
  materialType: string,
  materialId?: string,
  preferredCellConfigTypes?: string[],
  alternateMaterialTypes: string[] = []
): Calculation | null {
  if (!materialId) return null;

  if (preferredCellConfigTypes?.length) {
    for (const configType of preferredCellConfigTypes) {
      const match = calculations.find(
        (calc) =>
          calc.data?.cellConfig?.type === configType &&
          matchesMaterialId(calc, materialType, materialId, alternateMaterialTypes)
      );
      if (match) return match;
    }
  }

  return (
    calculations.find((calc) =>
      matchesMaterialId(calc, materialType, materialId, alternateMaterialTypes)
    ) || null
  );
}

function getPreferredCellConfigTypes(
  cellPurpose: string,
  bodyType?: string
): string[] | undefined {
  if (cellPurpose === RUSN_CELL_PURPOSE.SECTION_SWITCH) {
    return BREAKER_CELL_CONFIG_TYPE_PREFERENCES[cellPurpose];
  }

  if (
    bodyType === RUSN_CAMERA.KSO_A12_10 ||
    bodyType === RUSN_CAMERA.KSO_A17_20
  ) {
    return BREAKER_CELL_CONFIG_TYPE_PREFERENCES[cellPurpose];
  }

  return undefined;
}

function getLegacyRzaPreferredTypes(
  cellPurpose: string,
  bodyType?: string
): string[] | undefined {
  if (
    bodyType === RUSN_CAMERA.KSO_A12_10 ||
    bodyType === RUSN_CAMERA.KSO_A17_20
  ) {
    return BREAKER_CELL_CONFIG_TYPE_PREFERENCES[cellPurpose];
  }
  return undefined;
}

function findRzaCalculation(
  calculations: Calculation[],
  rzaId: string | undefined,
  cellPurpose: string,
  bodyType?: string
): Calculation | null {
  if (!rzaId) return null;

  const rzaTarget = getRzaCellTargetForPurpose(cellPurpose);

  if (rzaTarget) {
    const typedRzaMatch = calculations.find((calc) => {
      if (calc.data?.cellConfig?.type !== 'rza') return false;
      const targets = calc.data?.cellConfig?.rzaCellTargets;
      if (!targets?.length || !targets.includes(rzaTarget)) return false;
      return matchesMaterialId(calc, 'rza', rzaId);
    });
    if (typedRzaMatch) return typedRzaMatch;
  }

  const legacyPreferred = getLegacyRzaPreferredTypes(cellPurpose, bodyType);
  if (legacyPreferred?.length) {
    const legacyMatch = findByMaterialId(calculations, 'rza', rzaId, legacyPreferred);
    if (legacyMatch) return legacyMatch;
  }

  return findByMaterialId(calculations, 'rza', rzaId);
}

export function resolveRusnCellCalculations(
  calculations: Calculation[],
  materialIds: RusnMaterialIds,
  cellPurpose: string,
  hasMeterType: boolean,
  bodyType?: string
): RusnResolvedCalculations {
  const materialCalculations = excludeBhaCalculations(calculations);
  const preferredCellConfigTypes = getPreferredCellConfigTypes(cellPurpose, bodyType);

  const breakerCalculation = findByMaterialId(
    materialCalculations,
    'switch',
    materialIds.breakerId,
    preferredCellConfigTypes
  );
  const rzaCalculation = findRzaCalculation(
    calculations,
    materialIds.rzaId,
    cellPurpose,
    bodyType
  );
  const disconnectorCalculation = findByMaterialId(
    materialCalculations,
    'disconnector',
    materialIds.disconnectorId,
    preferredCellConfigTypes,
    ['sr']
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
      findByMaterialId(
        materialCalculations,
        'disconnector',
        materialIds.disconnectorId,
        ['disconnector'],
        ['sr']
      ) ||
      calculations.find((calc) => calc.data?.cellConfig?.type === 'disconnector') ||
      null;
  }

  let finalTnCalculation = tnCalculation;
  if (!finalTnCalculation && materialIds.tnId) {
    finalTnCalculation = calculations.find((calc) => calc.data?.cellConfig?.type === 'tn') || null;
  }
  if (!finalTnCalculation && cellPurpose === RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER) {
    finalTnCalculation = calculations.find((calc) => calc.data?.cellConfig?.type === 'tn') || null;
  }
  if (!finalTnCalculation && cellPurpose === RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER_ZSSH) {
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
  } else if (isVoltageTransformerCellPurpose(cellPurpose)) {
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
