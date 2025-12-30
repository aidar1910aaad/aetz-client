import type { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import TogglerWithInput from '../../../TogglerWithInput';
import CellItem from '../../cells/CellItem';

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
}: DguOutgoingCellsProps) {
  const outgoingCells = runnDguCells.filter(
    c => c.purpose !== 'РУНН-ДГУ-Торцевая панель' && c.purpose !== 'РУНН-ДГУ-Узел ДГУ кабель'
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
          cellPrefix="РУНН-ДГУ Отходящая"
        />
      ))}

      <button
        onClick={onAddCell}
        className="mt-4 px-4 py-2 bg-[#3A55DF] hover:bg-[#2d48be] text-white rounded text-sm font-medium"
      >
        + Добавить ещё отходящую
      </button>
    </TogglerWithInput>
  );
}

