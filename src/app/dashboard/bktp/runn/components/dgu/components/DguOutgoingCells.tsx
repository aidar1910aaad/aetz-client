import { useMemo } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import TogglerWithInput from '../../../TogglerWithInput';
import CellItem from '../../cells/CellItem';
import { useCalculationResultsStore } from '@/store/useCalculationResultsStore';
import { isDguOutgoingCell } from '../hooks/useDguOutgoingSummaries';

interface DguOutgoingCellsProps {
  runnDguCells: RunnCell[];
  onAddCell: () => void;
  onUpdateCell: (id: string, field: keyof RunnCell, value: string | number | string[]) => void;
  onRemoveCell: (id: string) => void;
  categoryMaterials: Material[];
  meterMaterials: Material[];
  meterMaterialsLoading: boolean;
  breakerOptions: string[];
  meterOptions: string[];
  switchingDeviceOptions: string[];
  rpsLeftMaterials?: Material[];
  inputCell?: RunnCell;
  fusesPnMaterials?: Material[];
  avtomatLityMaterials?: Material[];
  currentTransformerMaterials?: Material[];
}

export default function DguOutgoingCells({
  runnDguCells,
  onAddCell,
  onUpdateCell,
  onRemoveCell,
  categoryMaterials,
  meterMaterials,
  meterMaterialsLoading,
  breakerOptions,
  meterOptions,
  switchingDeviceOptions,
  rpsLeftMaterials,
  inputCell,
  fusesPnMaterials = [],
  avtomatLityMaterials = [],
  currentTransformerMaterials = [],
}: DguOutgoingCellsProps) {
  const updateCellResult = useCalculationResultsStore((s) => s.updateCellResult);

  const outgoingCells = useMemo(
    () => runnDguCells.filter(isDguOutgoingCell),
    [runnDguCells]
  );

  return (
    <TogglerWithInput label="РУНН-ДГУ: Отходящие">
      {outgoingCells.map((cell, idx) => (
        <CellItem
          key={cell.id}
          cell={cell}
          idx={idx}
          updateCell={onUpdateCell}
          removeCell={onRemoveCell}
          categoryMaterials={categoryMaterials}
          meterMaterials={meterMaterials}
          meterMaterialsLoading={meterMaterialsLoading}
          breakerOptions={breakerOptions}
          meterOptions={meterOptions}
          switchingDeviceOptions={switchingDeviceOptions}
          rpsLeftMaterials={rpsLeftMaterials}
          fusesPnMaterials={fusesPnMaterials}
          avtomatLityMaterials={avtomatLityMaterials}
          currentTransformerMaterials={currentTransformerMaterials}
          cellPrefix="РУНН-ДГУ Отходящая"
          inputCell={inputCell}
          onCalculationResult={updateCellResult}
        />
      ))}

      <button
        type="button"
        onClick={onAddCell}
        className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#8eba1e]/35 bg-[#8eba1e]/5 px-5 py-4 text-sm font-semibold text-[#5f7f14] transition-all hover:border-[#8eba1e] hover:bg-[#8eba1e]/10 hover:shadow-sm"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold text-[#8eba1e] shadow-sm">
          +
        </span>
        <span>Добавить ещё отходящую</span>
      </button>
    </TogglerWithInput>
  );
}

