export const RUSN_CAMERA = {
  KSO_366: 'Камера КСО 366',
  SIEMENS_8DJH: 'Камера 8DJH',
  KSO_A12_10: 'Камера КСО А12-10',
} as const;

export const RUSN_CELL_PURPOSE = {
  INPUT: 'Ввод',
  OUTGOING: 'Отходящая',
  TRANSFORMER: 'Трансформаторная',
  SECTION_SWITCH: 'Секционный выключатель',
  SECTION_DISCONNECTOR: 'Секционный разьединитель',
  VOLTAGE_TRANSFORMER: 'Трансформатор напряжения',
  AUX_TRANSFORMER: 'Трансформатор собственных нужд',
  SIEMENS_8DJH: 'Камера Siemens 8DJH',
  CABLE_JUMPER: 'Кабельная перемычка',
  INSULATION_ADAPTER: 'Изоляционный адаптер',
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

export function isBhaCalculationType(cellConfigType?: string): boolean {
  return Boolean(cellConfigType?.startsWith('bha_'));
}
