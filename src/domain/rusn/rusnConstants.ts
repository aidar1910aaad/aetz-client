export const RUSN_CAMERA = {
  KSO_366: 'Камера КСО 366',
  SIEMENS_8DJH: 'Камера 8DJH',
  KSO_A12_10: 'Камера КСО А12-10',
  KM1_AF: 'Камера КМ1-АФ',
  KSO_A17_20: 'Камера КСО А17-20',
} as const;

/** Камеры, в ячейках «Ввод» и «Отходящая» которых показывается выбор ПУ. */
export const RUSN_CAMERAS_WITH_CELL_METER: readonly string[] = [
  RUSN_CAMERA.KSO_A12_10,
  'КСО А12-10',
  RUSN_CAMERA.KM1_AF,
  RUSN_CAMERA.KSO_A17_20,
];

export function supportsCellMeterSelection(cameraName?: string, cellPurpose?: string): boolean {
  if (!cameraName || !cellPurpose) return false;

  if (
    cellPurpose !== RUSN_CELL_PURPOSE.INPUT &&
    cellPurpose !== RUSN_CELL_PURPOSE.OUTGOING
  ) {
    return false;
  }

  return RUSN_CAMERAS_WITH_CELL_METER.includes(cameraName);
}

export function isRusnCameraWithPerCellMeter(cameraName?: string): boolean {
  return Boolean(cameraName && RUSN_CAMERAS_WITH_CELL_METER.includes(cameraName));
}

export const RUSN_CELL_PURPOSE = {
  INPUT: 'Ввод',
  OUTGOING: 'Отходящая',
  TRANSFORMER: 'Трансформаторная',
  SECTION_SWITCH: 'Секционный выключатель',
  SECTION_DISCONNECTOR: 'Секционный разьединитель',
  VOLTAGE_TRANSFORMER: 'Трансформатор напряжения',
  VOLTAGE_TRANSFORMER_ZSSH: 'ТН с ЗСШ',
  AUX_TRANSFORMER: 'Трансформатор собственных нужд',
  SIEMENS_8DJH: 'Камера Siemens 8DJH',
  CABLE_JUMPER: 'Кабельная перемычка',
  INSULATION_ADAPTER: 'Изоляционный адаптер',
  BUSBAR_GROUNDING: 'Заземление сборных шин',
} as const;

export const KSO_366_CELL_TYPE = {
  KSO_13: 'Камера КСО 366-13',
  SHMR_14_15: 'Камера КСО 366 ШМР 14, 15',
} as const;

export const KSO_366_CALCULATION_IDS = {
  INPUT_OR_OUTGOING: 38,
  TRANSFORMER: 41,
  KSO_13: 39,
  SHMR_MAIN: 42,
  SHMR_ADDITIONAL: 44,
} as const;

export const SIEMENS_8DJH_CALCULATION_NAMES = {
  R: '8DJH (R) ',
  L: '8DJH (L)',
  L_RZA_TOKEN: '8DJH (L) РЗиА',
} as const;

export const KSO_A12_BHA_CALCULATION_SLUGS = {
  [RUSN_CELL_PURPOSE.INPUT]: 'bha-input',
  [RUSN_CELL_PURPOSE.TRANSFORMER]: 'bha-transformer',
  [RUSN_CELL_PURPOSE.OUTGOING]: 'bha-outgoing',
} as const;

export type KsoA12BhaPurpose = keyof typeof KSO_A12_BHA_CALCULATION_SLUGS;

export function isKsoA12BhaEligible(bodyType: string, purpose: string): purpose is KsoA12BhaPurpose {
  return bodyType === RUSN_CAMERA.KSO_A12_10 && purpose in KSO_A12_BHA_CALCULATION_SLUGS;
}

export const KSO_A17_20_CELL_CONFIG_TYPE = {
  ZSSH: 'kso_a17_zssh',
  BUSBAR_GROUNDING: 'busbar_grounding',
} as const;

export function findKsoA17CalculationByType<
  T extends { data?: { cellConfig?: { type?: string } } },
>(calculations: T[], cellConfigType: string): T | undefined {
  return calculations.find((calc) => calc.data?.cellConfig?.type === cellConfigType);
}

export function isVoltageTransformerCellPurpose(purpose: string): boolean {
  return (
    purpose === RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER ||
    purpose === RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER_ZSSH
  );
}

export function findKsoA17ZsshCalculation<
  T extends { data?: { cellConfig?: { type?: string } } },
>(calculations: T[]) {
  return findKsoA17CalculationByType(calculations, KSO_A17_20_CELL_CONFIG_TYPE.ZSSH);
}

export function findKsoA17BusbarGroundingCalculation<
  T extends { data?: { cellConfig?: { type?: string } } },
>(calculations: T[]) {
  return findKsoA17CalculationByType(
    calculations,
    KSO_A17_20_CELL_CONFIG_TYPE.BUSBAR_GROUNDING
  );
}

export function isBhaCalculationType(cellConfigType?: string): boolean {
  return Boolean(cellConfigType?.startsWith('bha_'));
}

/** Приоритет `cellConfig.type` при подборе калькуляции по материалу ячейки. */
export const BREAKER_CELL_CONFIG_TYPE_PREFERENCES: Partial<Record<string, string[]>> = {
  [RUSN_CELL_PURPOSE.INPUT]: ['input', '10kv'],
  [RUSN_CELL_PURPOSE.OUTGOING]: ['outgoing'],
  [RUSN_CELL_PURPOSE.TRANSFORMER]: ['outgoing'],
  [RUSN_CELL_PURPOSE.SECTION_SWITCH]: ['section_switch'],
  [RUSN_CELL_PURPOSE.SECTION_DISCONNECTOR]: ['disconnector'],
};
