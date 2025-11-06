import { useEffect } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import { useDguStore } from '@/store/useDguStore';

export function useDguCellsSync(
  runnDguCells: RunnCell[],
  runnDguInputCell: RunnCell
) {
  const dgu = useDguStore();

  useEffect(() => {
    // Обновляем ячейку ввода в store
    if (runnDguInputCell.breaker || runnDguInputCell.meterType) {
      dgu.addCell({
        id: runnDguInputCell.id,
        purpose: runnDguInputCell.purpose,
        breaker: runnDguInputCell.breaker,
        meterType: runnDguInputCell.meterType,
        nominalPower: runnDguInputCell.nominalPower,
        price: runnDguInputCell.price,
        quantity: runnDguInputCell.quantity,
        rza: runnDguInputCell.rza,
        ctRatio: runnDguInputCell.ctRatio,
        switchingDevice: runnDguInputCell.switchingDevice,
        rubilniki: runnDguInputCell.rubilniki,
      });
    }
    
    // Обновляем остальные ячейки в store
    runnDguCells.forEach(cell => {
      dgu.addCell({
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
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runnDguCells, runnDguInputCell]);
}

