import type { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import TogglerWithInput from '../../../TogglerWithInput';
import MaterialSummaryTable from '../../common/MaterialSummaryTable';
import { Select } from '@/components/ui/select';
import {
  useRunnBreakerCalculation,
  useRunnCounterCalculation,
} from '@/hooks/useRunnInputCalculation';
import CalculationDisplay from '../../calculations/CalculationDisplay';
import { extractCurrentFromBreakerName } from '@/utils/panelNameUtils';

interface DguInputCellProps {
  cell: RunnCell;
  onUpdate: (field: keyof RunnCell, val: string | number) => void;
  breakerOptions: string[];
  meterOptions: string[];
  categoryMaterials: Material[];
  meterMaterials: Material[];
  autoSelectedMaterial: Material | null;
  currentTransformerMaterials?: Material[];
}

export default function DguInputCell({
  cell,
  onUpdate,
  breakerOptions,
  meterOptions,
  categoryMaterials,
  meterMaterials,
  autoSelectedMaterial,
  currentTransformerMaterials = [],
}: DguInputCellProps) {
  const {
    calculation: breakerCalculation,
    loading: breakerCalculationLoading,
    error: breakerCalculationError,
  } = useRunnBreakerCalculation(cell);
  const {
    calculation: counterCalculation,
    loading: counterCalculationLoading,
    error: counterCalculationError,
  } = useRunnCounterCalculation(cell);

  let currentTransformer: { name: string; price: number; quantity: number } | null = null;
  if (cell.breaker && currentTransformerMaterials.length > 0) {
    const breakerCurrent = extractCurrentFromBreakerName(cell.breaker);
    if (breakerCurrent) {
      for (const material of currentTransformerMaterials) {
        const match = material.name.match(/(\d+)\/5\b/i);
        const materialCurrent = match ? parseInt(match[1], 10) : null;
        if (materialCurrent && materialCurrent >= breakerCurrent) {
          currentTransformer = {
            name: material.name,
            price: parseFloat(material.price.toString()),
            quantity: cell.meterType ? 6 : 3,
          };
          break;
        }
      }
    }
  }

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
        <Select
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
        </Select>
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

      {breakerCalculation && (
        <CalculationDisplay
          cell={cell}
          calculation={breakerCalculation}
          materialType="withdrawable_breaker"
          currentTransformer={currentTransformer}
        />
      )}
      {breakerCalculationLoading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-gray-600">Загрузка калькуляции автомата...</p>
        </div>
      )}
      {breakerCalculationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-red-600">{breakerCalculationError}</p>
        </div>
      )}

      {counterCalculation && cell.meterType && (
        <CalculationDisplay
          cell={cell}
          calculation={counterCalculation}
          materialType="counter"
        />
      )}
      {counterCalculationLoading && cell.meterType && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-gray-600">Загрузка калькуляции ПУ...</p>
        </div>
      )}
      {counterCalculationError && cell.meterType && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-red-600">{counterCalculationError}</p>
        </div>
      )}
    </TogglerWithInput>
  );
}

