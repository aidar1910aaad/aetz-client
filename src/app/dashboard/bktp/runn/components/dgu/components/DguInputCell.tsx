import type { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import TogglerWithInput from '../../TogglerWithInput';
import MaterialSummaryTable from '../../MaterialSummaryTable';

interface DguInputCellProps {
  cell: RunnCell;
  onUpdate: (field: keyof RunnCell, val: string | number) => void;
  breakerOptions: string[];
  meterOptions: string[];
  categoryMaterials: Material[];
  meterMaterials: Material[];
  autoSelectedMaterial: Material | null;
}

export default function DguInputCell({
  cell,
  onUpdate,
  breakerOptions,
  meterOptions,
  categoryMaterials,
  meterMaterials,
  autoSelectedMaterial,
}: DguInputCellProps) {
  const renderSelectBlock = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: string[],
    isAutoSelected?: boolean,
    isReadOnly?: boolean
  ) => (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <span className="text-xs font-medium text-[#3A55DF]">
        {label}
        {isAutoSelected && (
          <span className="ml-1 text-green-600 text-[10px]">(авто)</span>
        )}
      </span>
      {isReadOnly ? (
        <div className="border border-green-300 bg-green-50 rounded px-2 py-1 text-sm text-gray-700 cursor-not-allowed">
          {value || "—"}
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF] ${
            isAutoSelected 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300'
          }`}
        >
          <option value="">—</option>
          {options.map((opt, index) => (
            <option key={`${opt}-${index}`} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  const isAutoSelected = autoSelectedMaterial && cell.breaker === autoSelectedMaterial.name;

  return (
    <TogglerWithInput label="РУНН-ДГУ: Ввод" defaultEnabled>
      <div className="flex gap-4 items-end p-4 rounded bg-white border border-gray-100">
        {renderSelectBlock(
          'Автомат выкатной',
          cell.breaker,
          (val) => onUpdate('breaker', val),
          breakerOptions,
          isAutoSelected,
          true // Только для чтения в ячейке Ввод
        )}

        {renderSelectBlock(
          'ПУ',
          cell.meterType ?? '',
          (val) => onUpdate('meterType', val),
          meterOptions
        )}

        <div className="flex flex-col gap-1 min-w-[100px]">
          <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
          <input
            type="number"
            min={1}
            value={cell.quantity || 1}
            onChange={(e) => onUpdate('quantity', Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
          />
        </div>
      </div>
      <MaterialSummaryTable 
        cell={cell} 
        categoryMaterials={categoryMaterials}
        meterMaterials={meterMaterials}
      />
    </TogglerWithInput>
  );
}

