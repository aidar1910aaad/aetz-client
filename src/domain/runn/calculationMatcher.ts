import { Calculation } from '@/api/calculations';
import { extractCurrentFromBreakerName } from '@/utils/panelNameUtils';
import { RUNN_CELL_CONFIG_TYPE } from './runnConstants';

type MaterialType =
  | 'withdrawable_breaker'
  | 'molded_case_breaker'
  | 'counter';

type CalculationMaterial = {
  name?: string;
};

function getMaterials(calculation: Calculation, materialType: MaterialType): CalculationMaterial[] {
  const materials = calculation.data?.cellConfig?.materials?.[materialType];
  return Array.isArray(materials) ? materials : [];
}

function hasCellConfigType(calculation: Calculation, type: string): boolean {
  return calculation.data?.cellConfig?.type === type;
}

export function materialMatchesByNameOrCurrent(
  materialName: string | undefined,
  selectedName: string | undefined
): boolean {
  if (!materialName || !selectedName) return false;
  if (materialName === selectedName) return true;

  const selectedCurrent = extractCurrentFromBreakerName(selectedName);
  const materialCurrent = extractCurrentFromBreakerName(materialName);
  return selectedCurrent !== null && selectedCurrent === materialCurrent;
}

export function findCalculationByMaterial(
  calculations: Calculation[],
  cellConfigType: string,
  materialType: MaterialType,
  selectedName: string | undefined
): Calculation | undefined {
  return calculations.find((calculation) => {
    if (!hasCellConfigType(calculation, cellConfigType)) return false;
    const materials = getMaterials(calculation, materialType);
    return materials.some((material) =>
      materialMatchesByNameOrCurrent(material.name, selectedName)
    );
  });
}

export function findInputCalculation(
  calculations: Calculation[],
  materialType: 'withdrawable_breaker' | 'counter',
  selectedName: string | undefined
): Calculation | undefined {
  return (
    findCalculationByMaterial(
      calculations,
      RUNN_CELL_CONFIG_TYPE.INPUT,
      materialType,
      selectedName
    ) ??
    calculations.find(
      (calculation) =>
        hasCellConfigType(calculation, RUNN_CELL_CONFIG_TYPE.INPUT) &&
        getMaterials(calculation, materialType).length > 0
    )
  );
}

export function findSectionSwitchCalculation(
  calculations: Calculation[],
  breakerName: string | undefined
): Calculation | undefined {
  return (
    findCalculationByMaterial(
      calculations,
      RUNN_CELL_CONFIG_TYPE.SECTION_SWITCH,
      'molded_case_breaker',
      breakerName
    ) ??
    calculations.find((calculation) =>
      hasCellConfigType(calculation, RUNN_CELL_CONFIG_TYPE.SECTION_SWITCH)
    )
  );
}

export function findOutgoingMeterCalculation(
  calculations: Calculation[],
  meterName: string | undefined
): Calculation | undefined {
  return calculations.find((calculation) => {
    if (!hasCellConfigType(calculation, RUNN_CELL_CONFIG_TYPE.OUTGOING)) return false;
    const name = calculation.name?.toLowerCase() ?? '';
    const isMeterCalculation =
      name.includes('пу') || name.includes('счетчик') || name.includes('meter');
    return (
      isMeterCalculation &&
      getMaterials(calculation, 'counter').some((material) => material.name === meterName)
    );
  });
}

export function findBaseOutgoingCalculation(
  calculations: Calculation[]
): Calculation | undefined {
  return calculations.find((calculation) => {
    if (!hasCellConfigType(calculation, RUNN_CELL_CONFIG_TYPE.OUTGOING)) return false;
    return getMaterials(calculation, 'counter').length === 0;
  });
}

export function findTorcevaiaCalculation(
  calculations: Calculation[]
): Calculation | undefined {
  return calculations.find(
    (calculation) =>
      calculation.name === 'Торцевая панель' || calculation.slug === 'торцевая-панель'
  );
}

export function findOutgoingCalculationByCaseAndMaterial(
  calculations: Calculation[],
  caseSize: number | string,
  materialType: 'withdrawable_breaker' | 'molded_case_breaker',
  selectedNames: string[]
): Calculation | undefined {
  return calculations.find((calculation) => {
    if (!hasCellConfigType(calculation, RUNN_CELL_CONFIG_TYPE.OUTGOING)) return false;
    if (!calculation.name.includes(caseSize.toString())) return false;

    const materials = getMaterials(calculation, materialType);
    return selectedNames.some((selectedName) =>
      materials.some((material) => material.name === selectedName)
    );
  });
}
