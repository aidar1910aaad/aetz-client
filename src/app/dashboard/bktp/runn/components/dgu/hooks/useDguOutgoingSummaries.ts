import { useEffect, useMemo, useRef } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import { useCalculationResultsStore } from '@/store/useCalculationResultsStore';
import { useDguStore } from '@/store/useDguStore';
import { DGU_CELL_PURPOSE } from '@/domain/runn/runnConstants';

function isDguOutgoingCell(cell: RunnCell): boolean {
  return (
    cell.purpose === DGU_CELL_PURPOSE.OUTGOING ||
    (cell.purpose.includes('Отходящ') &&
      cell.purpose !== DGU_CELL_PURPOSE.TORCEVAIA &&
      cell.purpose !== DGU_CELL_PURPOSE.CABLE_NODE)
  );
}

function buildOutgoingSummaryName(cell: RunnCell): string {
  const calculationName =
    cell.selectedCalculationName ||
    cell.calculationName ||
    'Панель ЩО 70 (линейная)';

  const parts = [calculationName];
  const materialParts: string[] = [];

  if (cell.breaker) materialParts.push(cell.breaker);
  if (cell.meterType) materialParts.push(cell.meterType);
  if (cell.rubilniki?.length) {
    const rubilniki = cell.rubilniki.filter((r) => r && r.trim() !== '');
    if (rubilniki.length > 0) materialParts.push(rubilniki.join(', '));
  }
  if (materialParts.length > 0) {
    parts.push(materialParts.join(', '));
  }

  return `РУНН-ДГУ: ${parts.join(' - ')}`;
}

/** Одна строка сводки на отходящую: основная калькуляция + ПУ (как в РУНН). */
export function useDguOutgoingSummaries(outgoingCells: RunnCell[]) {
  const results = useCalculationResultsStore((s) => s.results);
  const setCellSummary = useDguStore((s) => s.setCellSummary);
  const lastSyncKeyRef = useRef<string>('');

  const outgoingSyncKey = useMemo(() => {
    return outgoingCells
      .map((cell) => {
        const r = results[cell.id];
        return [
          cell.id,
          cell.quantity ?? 1,
          cell.selectedCalculationName ?? '',
          cell.meterType ?? '',
          r?.mainCalculation ?? 0,
          r?.meterCalculation ?? 0,
        ].join(':');
      })
      .join('|');
  }, [outgoingCells, results]);

  useEffect(() => {
    if (outgoingSyncKey === lastSyncKeyRef.current) {
      return;
    }
    lastSyncKeyRef.current = outgoingSyncKey;

    outgoingCells.forEach((cell) => {
      const cellResults = results[cell.id];
      const quantity = cell.quantity || 1;

      if (!cellResults) {
        return;
      }

      let pricePerUnit = cellResults.mainCalculation || 0;
      if (cell.meterType && cellResults.meterCalculation) {
        pricePerUnit += cellResults.meterCalculation;
      }

      if (pricePerUnit <= 0) {
        return;
      }

      const name = buildOutgoingSummaryName(cell);
      const totalPrice = pricePerUnit * quantity;

      setCellSummary({
        cellId: cell.id,
        name,
        quantity,
        pricePerUnit,
        totalPrice,
      });
    });
  }, [outgoingSyncKey, outgoingCells, results, setCellSummary]);
}

export { isDguOutgoingCell };
