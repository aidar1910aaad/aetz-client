export const KSO_A17_20_CELL_TYPES = ['kso_a17_zssh', 'busbar_grounding'] as const;

export type KsoA17CellType = (typeof KSO_A17_20_CELL_TYPES)[number];

export const KSO_A17_20_CALCULATION_GROUP_SLUGS = [
  'kamera-kso-a17-20',
  'kso-a17-20',
] as const;

export const KSO_A17_20_CELL_TYPE_LABELS: Record<KsoA17CellType, string> = {
  kso_a17_zssh: 'ТН с ЗСШ',
  busbar_grounding: 'Заземление сборных шин',
};

export function isKsoA17CellType(type?: string): type is KsoA17CellType {
  return KSO_A17_20_CELL_TYPES.includes(type as KsoA17CellType);
}

export function isKsoA17CalculationGroup(groupSlug?: string): boolean {
  if (!groupSlug) return false;
  const normalized = decodeURIComponent(groupSlug).trim().toLowerCase();
  return (KSO_A17_20_CALCULATION_GROUP_SLUGS as readonly string[]).includes(normalized);
}

export function getKsoA17CellTypeLabel(type?: string): string | undefined {
  if (!isKsoA17CellType(type)) return undefined;
  return KSO_A17_20_CELL_TYPE_LABELS[type];
}
