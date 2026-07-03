import { RUSN_CELL_PURPOSE } from '@/domain/rusn/rusnConstants';

/** Подтип ячейки для калькуляций с типом `rza`. */
export const RZA_CELL_TARGETS = [
  'input',
  'section_switch',
  'outgoing',
  'transformer',
  'kso_a17_zssh',
  'tn',
] as const;

export type RzaCellTarget = (typeof RZA_CELL_TARGETS)[number];

export const RZA_CELL_TARGET_LABELS: Record<RzaCellTarget, string> = {
  input: 'Ввод',
  section_switch: 'Секционный выключатель',
  outgoing: 'Отходящая',
  transformer: 'Трансформаторная',
  kso_a17_zssh: 'ТН с ЗСШ',
  tn: 'Трансформатор напряжения',
};

/** Цели РЗА, доступные в группе КСО А17-20. */
export const KSO_A17_RZA_CELL_TARGETS: RzaCellTarget[] = [
  'input',
  'section_switch',
  'outgoing',
  'transformer',
  'kso_a17_zssh',
  'tn',
];

/** Цели РЗА для остальных камер (без специфики А17-20). */
export const STANDARD_RZA_CELL_TARGETS: RzaCellTarget[] = [
  'input',
  'section_switch',
  'outgoing',
  'transformer',
  'tn',
];

export function isRzaCellTarget(value: string): value is RzaCellTarget {
  return (RZA_CELL_TARGETS as readonly string[]).includes(value);
}

export function getRzaCellTargetsForGroup(groupSlug?: string): RzaCellTarget[] {
  const normalized = decodeURIComponent(groupSlug || '')
    .trim()
    .toLowerCase();
  const isA17 =
    normalized === 'kamera-kso-a17-20' ||
    normalized === 'kso-a17-20' ||
    normalized.includes('a17-20') ||
    normalized.includes('а17-20');

  return isA17 ? KSO_A17_RZA_CELL_TARGETS : STANDARD_RZA_CELL_TARGETS;
}

/** Назначение ячейки РУСН → подтип для поиска калькуляции РЗА. */
export function getRzaCellTargetForPurpose(cellPurpose: string): RzaCellTarget | undefined {
  const map: Partial<Record<string, RzaCellTarget>> = {
    [RUSN_CELL_PURPOSE.INPUT]: 'input',
    [RUSN_CELL_PURPOSE.SECTION_SWITCH]: 'section_switch',
    [RUSN_CELL_PURPOSE.OUTGOING]: 'outgoing',
    [RUSN_CELL_PURPOSE.TRANSFORMER]: 'transformer',
    [RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER_ZSSH]: 'kso_a17_zssh',
    [RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER]: 'tn',
  };

  return map[cellPurpose];
}

export function formatRzaCellTargets(targets?: string[]): string {
  if (!targets?.length) return '';
  return targets
    .filter(isRzaCellTarget)
    .map((target) => RZA_CELL_TARGET_LABELS[target])
    .join(', ');
}
