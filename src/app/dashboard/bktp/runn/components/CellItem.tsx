import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import MaterialSummaryTable from './MaterialSummaryTable';
import SwitchingDeviceSelector from './SwitchingDeviceSelector';
import CellParameters from './CellParameters';
import SwitchingDeviceLogic from './SwitchingDeviceLogic';

interface CellItemProps {
  cell: RunnCell;
  idx: number;
  updateCell: (id: string, field: keyof RunnCell, value: string | number) => void;
  removeCell: (id: string) => void;
  categoryMaterials: Material[];
  meterMaterials: Material[];
  meterMaterialsLoading: boolean;
  breakerOptions: string[];
  meterOptions: string[];
  switchingDeviceOptions: string[];
}

export default function CellItem({ 
  cell, 
  idx, 
  updateCell, 
  removeCell, 
  categoryMaterials, 
  meterMaterials, 
  meterMaterialsLoading, 
  breakerOptions, 
  meterOptions, 
  switchingDeviceOptions 
}: CellItemProps) {
  const cellWithMethods = {
    ...cell,
    update: (field: keyof RunnCell, val: string | number) => updateCell(cell.id, field, val),
    remove: () => removeCell(cell.id),
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="block text-sm text-gray-500 font-medium">Отходящая {idx + 1}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">ID: {cell.id.slice(0, 8)}...</span>
        </div>
      </div>

      <div className="space-y-4">
        <SwitchingDeviceSelector cell={cellWithMethods} switchingDeviceOptions={switchingDeviceOptions} />
        <CellParameters 
          cell={cellWithMethods} 
          breakerOptions={breakerOptions} 
          meterOptions={meterOptions} 
          meterMaterialsLoading={meterMaterialsLoading}
          categoryMaterials={categoryMaterials}
        />
      </div>

      <SwitchingDeviceLogic cell={cellWithMethods} categoryMaterials={categoryMaterials} />
      <MaterialSummaryTable cell={cell} categoryMaterials={categoryMaterials} meterMaterials={meterMaterials} />
    </div>
  );
} 