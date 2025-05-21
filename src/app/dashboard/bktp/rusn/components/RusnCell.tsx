import { Material } from '@/api/material';
import { RusnCell as RusnCellType } from '@/store/useRusnStore';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';

interface Props {
  cell: RusnCellType;
  materials: {
    breaker: Material[];
    rza: Material[];
    meter: Material[];
  };
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
}

export default function RusnCell({ 
  cell, 
  materials, 
  onUpdate, 
  onRemove, 
  groupSlug,
  selectedGroupName,
  selectedCalculationName 
}: Props) {
  const { calculations, calculateCellTotal } = useRusnCalculation(groupSlug);

  const calculateTotal = () => {
    let total = 0;

    // Добавляем стоимость ячейки
    if (selectedGroupName && selectedCalculationName) {
      const cellCalculation = calculations.cell.find(c => c.name === selectedCalculationName);
      if (cellCalculation) {
        total += calculateCellTotal(cellCalculation.id);
      }
    }

    // Добавляем стоимость материалов
    if (cell.breaker) {
      const breaker = materials.breaker.find(m => m.id.toString() === cell.breaker);
      if (breaker) {
        total += Number(breaker.price) * (cell.count || 1);
      }
    }

    if (cell.rza) {
      const rza = materials.rza.find(m => m.id.toString() === cell.rza);
      if (rza) {
        total += Number(rza.price) * (cell.count || 1);
      }
    }

    if (cell.meterType) {
      const meter = materials.meter.find(m => m.id.toString() === cell.meterType);
      if (meter) {
        total += Number(meter.price) * (cell.count || 1);
      }
    }

    return total;
  };

  const renderSelectBlock = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: Material[],
    calculationType?: 'breaker' | 'rza' | 'meter'
  ) => (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <span className="text-xs font-medium text-[#3A55DF]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id.toString()}>
            {opt.name} ({opt.code})
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
        {renderSelectBlock(
          'Выключатель',
          cell.breaker || '',
          (val) => onUpdate(cell.id, 'breaker', val),
          materials.breaker,
          'breaker'
        )}

        {cell.purpose !== 'СР' &&
          renderSelectBlock(
            'РЗА',
            cell.rza || '',
            (val) => onUpdate(cell.id, 'rza', val),
            materials.rza,
            'rza'
          )}

        {cell.purpose !== 'СР' &&
          cell.purpose !== 'ТСН' &&
          cell.purpose !== 'ТН' &&
          renderSelectBlock(
            'ТТ',
            cell.ctRatio || '',
            (val) => onUpdate(cell.id, 'ctRatio', val),
            materials.ctRatio || []
          )}

        {cell.purpose !== 'СР' &&
          cell.purpose !== 'ТСН' &&
          cell.purpose !== 'ТН' &&
          cell.purpose !== 'СВ' &&
          renderSelectBlock(
            'ПУ',
            cell.meterType || '',
            (val) => onUpdate(cell.id, 'meterType', val),
            materials.meter,
            'meter'
          )}

        <div className="flex flex-col gap-1 min-w-[100px]">
          <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
          <input
            type="number"
            min={1}
            value={cell.count || 1}
            onChange={(e) => onUpdate(cell.id, 'count', Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
          />
        </div>

        <button
          onClick={() => onRemove(cell.id)}
          className="text-red-600 hover:text-red-800 text-sm font-bold ml-auto"
          title="Удалить ячейку"
        >
          ✕
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {cell.breaker && (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {selectedGroupName} {selectedCalculationName} Выключатель: {materials.breaker.find(m => m.id.toString() === cell.breaker)?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {(calculateCellTotal(calculations.cell.find(c => c.name === selectedCalculationName)?.id || 0) + 
                    Number(materials.breaker.find(m => m.id.toString() === cell.breaker)?.price || 0) * (cell.count || 1)).toLocaleString('ru-RU')} ₸
                </td>
              </tr>
            )}

            {cell.rza && (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {selectedGroupName} {selectedCalculationName} РЗА: {materials.rza.find(m => m.id.toString() === cell.rza)?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {(calculateCellTotal(calculations.cell.find(c => c.name === selectedCalculationName)?.id || 0) + 
                    Number(materials.rza.find(m => m.id.toString() === cell.rza)?.price || 0) * (cell.count || 1)).toLocaleString('ru-RU')} ₸
                </td>
              </tr>
            )}

            {cell.meterType && (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {selectedGroupName} {selectedCalculationName} Счетчик: {materials.meter.find(m => m.id.toString() === cell.meterType)?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {(calculateCellTotal(calculations.cell.find(c => c.name === selectedCalculationName)?.id || 0) + 
                    Number(materials.meter.find(m => m.id.toString() === cell.meterType)?.price || 0) * (cell.count || 1)).toLocaleString('ru-RU')} ₸
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 