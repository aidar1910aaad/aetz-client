import { RusnCell, RusnCellSummary } from '@/store/useRusnStore';
import { formatCellDescription, RusnMaterials } from '@/utils/rusnMaterials';
import { KSO_366_CELL_TYPE, RUSN_CAMERA, RUSN_CELL_PURPOSE } from './rusnConstants';

export function getRusnCellSummaryIds(cellId: string): string[] {
  return [cellId, `${cellId}_main`, `${cellId}_additional`];
}

export function resolveSummaryToCellId(summaryCellId: string): string {
  return summaryCellId.replace(/_(main|additional)$/, '');
}

export function pruneOrphanRusnCellSummaries(
  cellConfigs: { id: string }[],
  summaries: RusnCellSummary[]
): RusnCellSummary[] {
  const validIds = new Set(cellConfigs.map((cell) => cell.id));
  return summaries.filter((summary) => validIds.has(resolveSummaryToCellId(summary.cellId)));
}

export function buildRusnCellSummaries(
  cell: RusnCell,
  materials: RusnMaterials,
  bodyType: string,
  total: number,
  transformerVoltage?: string
): RusnCellSummary[] {
  const shouldAddToSummary =
    total > 0 &&
    (cell.purpose !== RUSN_CELL_PURPOSE.SECTION_DISCONNECTOR ||
      bodyType !== RUSN_CAMERA.KSO_366 ||
      Boolean(cell.cellType));

  if (!shouldAddToSummary) return [];

  const cellDescription = formatCellDescription(cell, materials, bodyType, transformerVoltage);

  if (
    cell.cellType === KSO_366_CELL_TYPE.SHMR_14_15 &&
    cell.calculationBreakdown &&
    Array.isArray(cellDescription)
  ) {
    return [
      {
        cellId: `${cell.id}_main`,
        name: cellDescription[0],
        quantity: 2,
        pricePerUnit: cell.calculationBreakdown.main.price,
        totalPrice: cell.calculationBreakdown.main.price * 2,
      },
      {
        cellId: `${cell.id}_additional`,
        name: cellDescription[1],
        quantity: cell.count || 1,
        pricePerUnit: cell.calculationBreakdown.additional.price,
        totalPrice: cell.calculationBreakdown.additional.price * (cell.count || 1),
      },
    ];
  }

  if (cell.cellType === KSO_366_CELL_TYPE.SHMR_14_15) return [];

  return [
    {
      cellId: cell.id,
      name: Array.isArray(cellDescription) ? cellDescription.join('\n') : cellDescription,
      quantity: cell.count || 1,
      pricePerUnit: total / (cell.count || 1),
      totalPrice: total,
    },
  ];
}
