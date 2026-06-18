export const RUNN_CALCULATION_GROUP_SLUG = 'panel-sho-70';

export const RUNN_CELL_PURPOSE = {
  INPUT: 'Ввод',
  SECTION_SWITCH: 'Секционный выключатель',
  OUTGOING: 'Отходящая',
  TORCEVAIA: 'Торцевая панель',
} as const;

export const RUNN_CELL_CONFIG_TYPE = {
  INPUT: 'input',
  SECTION_SWITCH: 'section_switch',
  OUTGOING: 'outgoing',
  TORCEVAIA: 'torcevaia',
} as const;

export const DGU_CELL_PURPOSE = {
  INPUT: 'РУНН-ДГУ-Ввод',
  OUTGOING: 'РУНН-ДГУ-Отходящая',
  TORCEVAIA: 'РУНН-ДГУ-Торцевая панель',
  CABLE_NODE: 'РУНН-ДГУ-Узел ДГУ кабель',
} as const;

export function isInputPurpose(purpose: string): boolean {
  return purpose === RUNN_CELL_PURPOSE.INPUT || purpose === DGU_CELL_PURPOSE.INPUT;
}

export function isOutgoingPurpose(purpose: string): boolean {
  return (
    purpose.includes(RUNN_CELL_PURPOSE.OUTGOING) ||
    purpose.includes('РУНН-ДГУ-Отходящ')
  );
}

export function isTorcevaiaPurpose(purpose: string): boolean {
  return (
    purpose === RUNN_CELL_PURPOSE.TORCEVAIA || purpose === DGU_CELL_PURPOSE.TORCEVAIA
  );
}

export function toCalculationPurpose(purpose: string): string {
  if (purpose === DGU_CELL_PURPOSE.INPUT) return RUNN_CELL_PURPOSE.INPUT;
  if (purpose.includes('РУНН-ДГУ-Отходящ')) return RUNN_CELL_PURPOSE.OUTGOING;
  if (purpose === DGU_CELL_PURPOSE.TORCEVAIA) return RUNN_CELL_PURPOSE.TORCEVAIA;
  return purpose;
}
