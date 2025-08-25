'use client';

import { useRunnStore } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import TogglerWithInput from '../TogglerWithInput';
import CellItem from './CellItem';

interface OutgoingCellSectionProps {
  categoryMaterials?: Material[];
  meterMaterials?: Material[];
  meterMaterialsLoading?: boolean;
  rpsLeftMaterials?: Material[];
}

export default function OutgoingCellSection({
  categoryMaterials = [],
  meterMaterials = [],
  meterMaterialsLoading = false,
  rpsLeftMaterials = [],
}: OutgoingCellSectionProps) {
  const { cellConfigs, addCell, updateCell, removeCell } = useRunnStore();

  const breakerOptions = categoryMaterials.map((material) => material.name);
  const meterOptions = meterMaterials.map((material) => material.name);
  const switchingDeviceOptions = ['Воздушный', 'Литой корпус', 'Литой корпус + Рубильник', 'РПС'];

  const outgoingCells = cellConfigs.filter((c) => c.purpose === 'Отходящая');
  const isOpen = outgoingCells.length > 0;

  return (
    <TogglerWithInput
      label="Ячейка: Отходящая"
      toggled={isOpen}
      onToggle={() => {
        if (!isOpen) {
          addCell({
            purpose: 'Отходящая',
            breaker: '',
            meterType: '',
            switchingDevice: '',
            quantity: 1,
          });
        }
      }}
    >
      {outgoingCells.map((cell, idx) => (
        <CellItem
          key={cell.id}
          cell={cell}
          idx={idx}
          updateCell={updateCell}
          removeCell={removeCell}
          categoryMaterials={categoryMaterials}
          meterMaterials={meterMaterials}
          meterMaterialsLoading={meterMaterialsLoading}
          breakerOptions={breakerOptions}
          meterOptions={meterOptions}
          switchingDeviceOptions={switchingDeviceOptions}
          rpsLeftMaterials={rpsLeftMaterials}
        />
      ))}

      <button
        onClick={() =>
          addCell({
            purpose: 'Отходящая',
            breaker: '',
            meterType: '',
            switchingDevice: '',
            quantity: 1,
          })
        }
        className="mt-4 px-4 py-2 bg-[#3A55DF] hover:bg-[#2d48be] text-white rounded text-sm font-medium"
      >
        + Добавить ещё отходящую
      </button>
    </TogglerWithInput>
  );
}
