import { useEffect, useRef } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import { useDguStore } from '@/store/useDguStore';
import type { DguCell } from '@/store/useDguStore';

function toDguCell(cell: RunnCell): DguCell {
  return {
    id: cell.id,
    purpose: cell.purpose,
    breaker: cell.breaker,
    meterType: cell.meterType,
    nominalPower: cell.nominalPower,
    price: cell.price,
    quantity: cell.quantity,
    rza: cell.rza,
    ctRatio: cell.ctRatio,
    switchingDevice: cell.switchingDevice,
    rubilniki: cell.rubilniki,
    selectedCalculationName: cell.selectedCalculationName,
    calculationName: cell.calculationName,
  };
}

export function useDguCellsSync(
  runnDguCells: RunnCell[],
  runnDguInputCell: RunnCell
) {
  const setCells = useDguStore((s) => s.setCells);
  const lastSerializedRef = useRef<string>('');

  useEffect(() => {
    const nextCells: DguCell[] = [];

    if (runnDguInputCell.breaker || runnDguInputCell.meterType) {
      nextCells.push(toDguCell(runnDguInputCell));
    }

    runnDguCells.forEach((cell) => {
      nextCells.push(toDguCell(cell));
    });

    const storeCells = useDguStore.getState().cells;
    if (nextCells.length === 0 && storeCells.length > 0) {
      return;
    }

    const serialized = JSON.stringify(nextCells);
    if (serialized === lastSerializedRef.current) {
      return;
    }
    lastSerializedRef.current = serialized;
    setCells(nextCells);
  }, [runnDguCells, runnDguInputCell, setCells]);
}
