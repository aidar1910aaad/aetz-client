import { useCallback } from 'react';
import { useDguStore } from '@/store/useDguStore';

export function useDguSetCellSummary() {
  const setCellSummary = useDguStore((s) => s.setCellSummary);
  const removeCellSummary = useDguStore((s) => s.removeCellSummary);

  return useCallback(
    (
      cellId: string,
      name: string,
      pricePerUnit: number,
      quantity?: number
    ) => {
      if (pricePerUnit <= 0) {
        removeCellSummary(cellId);
        return;
      }

      const state = useDguStore.getState();
      const qty =
        quantity ??
        state.cells.find((c) => c.id === cellId)?.quantity ??
        1;

      const existing = state.cellSummaries.find((s) => s.cellId === cellId);
      const totalPrice = pricePerUnit * qty;
      if (
        existing &&
        existing.name === name &&
        existing.quantity === qty &&
        existing.pricePerUnit === pricePerUnit &&
        existing.totalPrice === totalPrice
      ) {
        return;
      }

      setCellSummary({
        cellId,
        name,
        quantity: qty,
        pricePerUnit,
        totalPrice,
      });
    },
    [setCellSummary, removeCellSummary]
  );
}
