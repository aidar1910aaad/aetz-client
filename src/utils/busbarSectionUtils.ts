import { BusMaterial, BUS_SPECS, BusSpec } from '@/types/rusn';

export const ALL_BUSBAR_SECTIONS = [
  '30x3',
  '40x4',
  '40x5',
  '50x5',
  '50x6',
  '60x6',
  '60x8',
  '60x10',
  '80x6',
  '80x8',
  '80x10',
  '100x6',
  '100x8',
  '100x10',
  '120x8',
  '120x10',
  '160x10',
] as const;

export function normalizeBusbarSection(section: string): string {
  return section.replace(/х/g, 'x').replace(/\s/g, '').toLowerCase();
}

export function isValidBusbarSection(section: string): boolean {
  return /^\d+x\d+(\.\d+)?$/i.test(normalizeBusbarSection(section));
}

export function parseBusbarSectionArea(section: string): number {
  const normalized = normalizeBusbarSection(section);
  const [w, h] = normalized.split('x').map(Number);
  return (w || 0) * (h || 0);
}

function getMaterialSpecKey(material: BusMaterial): 'aluminum' | 'copper' {
  if (material === 'АД' || material === 'АД2') return 'aluminum';
  return 'copper';
}

function getSpecsForMaterial(material: BusMaterial): BusSpec[] {
  const key = getMaterialSpecKey(material);
  return (BUS_SPECS as Record<string, BusSpec[]>)[key] ?? [];
}

function findSpecWeight(material: BusMaterial, section: string): number | null {
  const normalized = normalizeBusbarSection(section);
  const spec = getSpecsForMaterial(material).find(
    (s) => normalizeBusbarSection(s.size) === normalized
  );
  return spec?.weightPerMeter ?? null;
}

/** Коэффициент пересчёта веса при смене сечения */
export function getBusbarSectionWeightScale(
  fromSection: string,
  toSection: string,
  material: BusMaterial
): number {
  const fromNorm = normalizeBusbarSection(fromSection);
  const toNorm = normalizeBusbarSection(toSection);
  if (fromNorm === toNorm) return 1;

  const fromWeight = findSpecWeight(material, fromSection);
  const toWeight = findSpecWeight(material, toSection);
  if (fromWeight && toWeight && fromWeight > 0) {
    return toWeight / fromWeight;
  }

  const fromArea = parseBusbarSectionArea(fromSection);
  const toArea = parseBusbarSectionArea(toSection);
  if (fromArea > 0 && toArea > 0) {
    return toArea / fromArea;
  }

  return 1;
}

export function sortBusbarSections(sections: string[]): string[] {
  return [...sections].sort(
    (a, b) => parseBusbarSectionArea(a) - parseBusbarSectionArea(b)
  );
}
