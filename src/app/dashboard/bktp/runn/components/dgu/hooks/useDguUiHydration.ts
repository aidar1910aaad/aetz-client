import { useEffect, useRef } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import type { DguCell } from '@/store/useDguStore';
import { useDguStore } from '@/store/useDguStore';

const DGU_INPUT_PURPOSE = 'РУНН-ДГУ-Ввод';

const defaultInputCell = (): RunnCell => ({
  id: 'runn-dgu-input',
  purpose: DGU_INPUT_PURPOSE,
  breaker: '',
  meterType: '',
  quantity: 1,
  nominalPower: 0,
  price: 0,
});

function toRunnCell(cell: DguCell): RunnCell {
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
    selectedCalculationName: (cell as DguCell & { selectedCalculationName?: string })
      .selectedCalculationName,
    calculationName: (cell as DguCell & { calculationName?: string }).calculationName,
  };
}

/** Восстанавливает локальное UI-состояние ячеек ДГУ из persist/store */
export function useDguUiHydration(
  setRunnDguCells: (cells: RunnCell[]) => void,
  setRunnDguInputCell: (cell: RunnCell) => void
) {
  const hydratedRef = useRef(false);

  const hydrateFromStore = () => {
    if (hydratedRef.current) return;

    const { enabled, cells } = useDguStore.getState();
    if (!enabled && cells.length === 0) return;

    const input = cells.find((c) => c.purpose === DGU_INPUT_PURPOSE);
    const others = cells
      .filter((c) => c.purpose !== DGU_INPUT_PURPOSE)
      .map(toRunnCell);

    if (input) {
      setRunnDguInputCell({ ...defaultInputCell(), ...toRunnCell(input) });
    }
    if (others.length > 0) {
      setRunnDguCells(others);
    }

    hydratedRef.current = true;
  };

  useEffect(() => {
    if (useDguStore.persist.hasHydrated()) {
      hydrateFromStore();
      return;
    }

    const unsub = useDguStore.persist.onFinishHydration(() => {
      hydrateFromStore();
    });

    return unsub;
  }, [setRunnDguCells, setRunnDguInputCell]);
}
