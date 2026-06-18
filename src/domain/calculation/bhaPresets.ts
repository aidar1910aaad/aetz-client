import { RUSN_CELL_PURPOSE } from '@/domain/rusn/rusnConstants';

export const BHA_CELL_TYPES = ['bha_input', 'bha_transformer', 'bha_outgoing'] as const;

export type BhaCellType = (typeof BHA_CELL_TYPES)[number];

export interface BhaCalculationPreset {
  type: BhaCellType;
  name: string;
  slug: string;
  label: string;
  purpose: string;
}

export const BHA_CALCULATION_PRESETS: Record<BhaCellType, BhaCalculationPreset> = {
  bha_input: {
    type: 'bha_input',
    name: 'BHA — Вводная',
    slug: 'bha-input',
    label: 'BHA — Вводная',
    purpose: RUSN_CELL_PURPOSE.INPUT,
  },
  bha_transformer: {
    type: 'bha_transformer',
    name: 'BHA — Трансформаторная',
    slug: 'bha-transformer',
    label: 'BHA — Трансформаторная',
    purpose: RUSN_CELL_PURPOSE.TRANSFORMER,
  },
  bha_outgoing: {
    type: 'bha_outgoing',
    name: 'BHA — Отходящая',
    slug: 'bha-outgoing',
    label: 'BHA — Отходящая',
    purpose: RUSN_CELL_PURPOSE.OUTGOING,
  },
};

export const BHA_PURPOSE_TO_CELL_TYPE: Record<string, BhaCellType> = {
  [RUSN_CELL_PURPOSE.INPUT]: 'bha_input',
  [RUSN_CELL_PURPOSE.TRANSFORMER]: 'bha_transformer',
  [RUSN_CELL_PURPOSE.OUTGOING]: 'bha_outgoing',
};

export function isBhaCellType(type?: string): type is BhaCellType {
  return BHA_CELL_TYPES.includes(type as BhaCellType);
}

export function getBhaPreset(type?: string): BhaCalculationPreset | undefined {
  if (!isBhaCellType(type)) return undefined;
  return BHA_CALCULATION_PRESETS[type];
}

export function getBhaCellTypeLabel(type?: string): string | undefined {
  return getBhaPreset(type)?.label;
}

export function getBhaPresetByPurpose(purpose: string): BhaCalculationPreset | undefined {
  const cellType = BHA_PURPOSE_TO_CELL_TYPE[purpose];
  return cellType ? BHA_CALCULATION_PRESETS[cellType] : undefined;
}

export const KSO_A12_BHA_CELL_DESCRIPTIONS: Record<string, string> = {
  [RUSN_CELL_PURPOSE.INPUT]:
    'Камера КСО А12-10 10ВН1 (вводная) Выключатель нагрузки ВНА 10/630',
  [RUSN_CELL_PURPOSE.TRANSFORMER]:
    'Камера КСО А12-10 10ВН (трансформаторная) Выключатель нагрузки ВНА 10/630 с предохранителем',
  [RUSN_CELL_PURPOSE.OUTGOING]:
    'Камера КСО А12-10 10ВН1 (отходящая линия) Выключатель нагрузки ВНА 10/630',
};

export function getKsoA12BhaCellDescription(purpose: string): string | undefined {
  return KSO_A12_BHA_CELL_DESCRIPTIONS[purpose];
}

export const KSO_A12_10_CALCULATION_GROUP_SLUGS = ['kamera-kso-a12-10', 'kso-a12-10'] as const;

export function isKsoA12CalculationGroup(groupSlug?: string): boolean {
  if (!groupSlug) return false;
  const normalized = decodeURIComponent(groupSlug).trim().toLowerCase();
  return (KSO_A12_10_CALCULATION_GROUP_SLUGS as readonly string[]).includes(normalized);
}
