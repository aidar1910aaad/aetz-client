import { Calculation } from '@/hooks/useRusnCalculation';
import { getBhaPresetByPurpose } from '@/domain/calculation/bhaPresets';
import { isBhaCalculationType } from '@/domain/rusn/rusnConstants';

export function findKsoA12BhaCalculation(
  calculations: Calculation[],
  purpose: string
): Calculation | undefined {
  const preset = getBhaPresetByPurpose(purpose);
  if (!preset) return undefined;

  const byType = calculations.find(
    (calc) => calc.data?.cellConfig?.type === preset.type
  );
  if (byType) return byType;

  return calculations.find((calc) => calc.slug === preset.slug);
}

export { isBhaCalculationType };
