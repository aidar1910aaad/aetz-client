import { AreaPriceRange } from '@/api/bmz';

const DEFAULT_MAX_HEIGHT = 999999;

/** Нормализация старых записей без высоты */
export function normalizeAreaPriceRange(range: AreaPriceRange): AreaPriceRange {
  return {
    ...range,
    minHeight: range.minHeight ?? 0,
    maxHeight: range.maxHeight ?? DEFAULT_MAX_HEIGHT,
  };
}

export function intervalsOverlap(
  aMin: number,
  aMax: number,
  bMin: number,
  bMax: number,
): boolean {
  return aMin < bMax && aMax > bMin;
}

export function matchesAreaPriceRange(
  range: AreaPriceRange,
  params: { area: number; thickness: number; height: number },
): boolean {
  const r = normalizeAreaPriceRange(range);
  return (
    params.thickness >= r.minWallThickness &&
    params.thickness <= r.maxWallThickness &&
    params.area >= r.minArea &&
    params.area <= r.maxArea &&
    params.height >= r.minHeight &&
    params.height <= r.maxHeight
  );
}

export function findMatchingAreaPriceRange(
  ranges: AreaPriceRange[],
  params: { area: number; thickness: number; height: number },
): AreaPriceRange | undefined {
  const matching = ranges
    .map(normalizeAreaPriceRange)
    .filter((range) => matchesAreaPriceRange(range, params));

  if (matching.length === 0) return undefined;

  matching.sort((a, b) => {
    const areaSpanA = a.maxArea - a.minArea;
    const areaSpanB = b.maxArea - b.minArea;
    if (areaSpanA !== areaSpanB) return areaSpanA - areaSpanB;
    return a.maxHeight - a.minHeight - (b.maxHeight - b.minHeight);
  });

  return matching[0];
}

export function areaPriceRangesOverlap(a: AreaPriceRange, b: AreaPriceRange): boolean {
  const na = normalizeAreaPriceRange(a);
  const nb = normalizeAreaPriceRange(b);

  if (na.minWallThickness !== nb.minWallThickness) return false;

  return (
    intervalsOverlap(na.minArea, na.maxArea, nb.minArea, nb.maxArea) &&
    intervalsOverlap(na.minHeight, na.maxHeight, nb.minHeight, nb.maxHeight)
  );
}

export function isSameAreaPriceRange(a: AreaPriceRange, b: AreaPriceRange): boolean {
  return (
    a.minArea === b.minArea &&
    a.maxArea === b.maxArea &&
    a.minWallThickness === b.minWallThickness &&
    (a.minHeight ?? 0) === (b.minHeight ?? 0) &&
    (a.maxHeight ?? DEFAULT_MAX_HEIGHT) === (b.maxHeight ?? DEFAULT_MAX_HEIGHT)
  );
}
