import { Material } from '@/api/material';
import { RusnCell as RusnCellType } from '@/store/useRusnStore';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import { useEffect, useState } from 'react';
import BreakerCalculation from './BreakerCalculation';
import RzaCalculation from './RzaCalculation';

interface Props {
  cell: RusnCellType;
  materials: {
    breaker: Material[];
    rza: Material[];
    meter: Material[];
    transformer: Material[];
  };
  onUpdate: (
    id: string,
    field: keyof RusnCellType,
    value: RusnCellType[keyof RusnCellType]
  ) => void;
  onRemove: (id: string) => void;
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
}

// Конфигурация полей для каждого типа ячейки
const CELL_CONFIG = {
  Ввод: [
    { field: 'breaker', label: 'Вакуумный выключатель', materialType: 'breaker' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
    { field: 'meterType', label: 'ПУ', materialType: 'meter' },
    { field: 'transformer', label: 'Трансформатор тока', materialType: 'transformer' },
  ],
  СВ: [
    { field: 'breaker', label: 'Вакуумный выключатель', materialType: 'breaker' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
    { field: 'transformer', label: 'Трансформатор тока', materialType: 'transformer' },
  ],
  СР: [{ field: 'rza', label: 'РЗА', materialType: 'rza' }],
  ТР: [
    { field: 'transformer', label: 'Трансформатор', materialType: 'transformer' },
    { field: 'breaker', label: 'Выключатель', materialType: 'breaker' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
    { field: 'meterType', label: 'ПУ', materialType: 'meter' },
  ],
  Отходящая: [
    { field: 'breaker', label: 'Выключатель', materialType: 'breaker' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
    { field: 'meterType', label: 'ПУ', materialType: 'meter' },
    { field: 'transformer', label: 'Трансформатор тока', materialType: 'transformer' },
  ],
  ТН: [
    { field: 'transformer', label: 'Трансформатор напряжения', materialType: 'transformer' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
  ],
  ТСН: [{ field: 'transformer', label: 'Силовой трансформатор', materialType: 'transformer' }],
} as const;

export default function RusnCell({
  cell,
  materials,
  onUpdate,
  onRemove,
  groupSlug,
  selectedGroupName,
  selectedCalculationName,
}: Props) {
  const { calculations } = useRusnCalculation(groupSlug);
  const [currentCalculation, setCurrentCalculation] = useState<string>(selectedCalculationName);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setCurrentCalculation(selectedCalculationName);
  }, [selectedCalculationName]);

  const findMatchingCalculation = (breakerId: string, rzaId?: string) => {
    if (!calculations.cell || (!breakerId && !rzaId)) return null;

    const breakerCalculation = breakerId
      ? calculations.cell.find((calc) => {
          if (!calc.data?.cellConfig?.materials?.switch) return false;
          return calc.data.cellConfig.materials.switch.some(
            (switchItem) => switchItem.id === breakerId
          );
        })
      : null;

    const rzaCalculation = rzaId
      ? calculations.cell.find((calc) => {
          if (!calc.data?.cellConfig?.materials?.rza) return false;
          return calc.data.cellConfig.materials.rza.some((rzaItem) => rzaItem.id === rzaId);
        })
      : null;

    return { breakerCalculation, rzaCalculation };
  };

  useEffect(() => {
    const calculateTotal = () => {
      let newCalculationName = currentCalculation;
      let rzaCalculationName = '';

      if (cell.breaker?.id || cell.rza?.id) {
        const { breakerCalculation, rzaCalculation } = findMatchingCalculation(
          cell.breaker?.id,
          cell.rza?.id
        );

        if (breakerCalculation) {
          newCalculationName = breakerCalculation.name;
          setCurrentCalculation(breakerCalculation.name);
        }

        if (rzaCalculation) {
          rzaCalculationName = rzaCalculation.name;
        }
      } else if (selectedGroupName && selectedCalculationName) {
        const cellCalculation = calculations.cell.find((c) => c.name === selectedCalculationName);
        if (cellCalculation) {
          newCalculationName = cellCalculation.name;
          setCurrentCalculation(cellCalculation.name);
        }
      }

      const currentCalc = calculations.cell.find((c) => c.name === newCalculationName);
      if (!currentCalc) return;

      const rzaCalc = rzaCalculationName
        ? calculations.cell.find((c) => c.name === rzaCalculationName)
        : null;

      // Расчет для выключателя
      const calculationData = currentCalc.data.calculation;
      const materialsTotal =
        currentCalc.data.categories.reduce(
          (sum, category) =>
            sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
          0
        ) +
        (cell.breaker
          ? Number(materials.breaker.find((m) => m.id.toString() === cell.breaker?.id)?.price || 0)
          : 0);

      const salary = calculationData.hourlyRate * 4;
      const overheadCost = (materialsTotal * calculationData.overheadPercentage) / 100;
      const productionCost = materialsTotal + salary + overheadCost;
      const adminCost = (materialsTotal * calculationData.adminPercentage) / 100;
      const fullCost = productionCost + adminCost;
      const plannedProfit = (fullCost * calculationData.plannedProfitPercentage) / 100;
      const wholesalePrice = fullCost + plannedProfit;
      const ndsAmount = (wholesalePrice * calculationData.ndsPercentage) / 100;
      const finalPrice = wholesalePrice + ndsAmount;

      // Расчет для РЗА если есть
      let rzaFinalPrice = 0;
      if (rzaCalc) {
        const rzaCalculationData = rzaCalc.data.calculation;
        const rzaMaterialsTotal =
          rzaCalc.data.categories.reduce(
            (sum, category) =>
              sum +
              category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
            0
          ) + Number(materials.rza.find((m) => m.id.toString() === cell.rza?.id)?.price || 0);

        const rzaSalary = rzaCalculationData.hourlyRate * 4;
        const rzaOverheadCost = (rzaMaterialsTotal * rzaCalculationData.overheadPercentage) / 100;
        const rzaProductionCost = rzaMaterialsTotal + rzaSalary + rzaOverheadCost;
        const rzaAdminCost = (rzaMaterialsTotal * rzaCalculationData.adminPercentage) / 100;
        const rzaFullCost = rzaProductionCost + rzaAdminCost;
        const rzaPlannedProfit = (rzaFullCost * rzaCalculationData.plannedProfitPercentage) / 100;
        const rzaWholesalePrice = rzaFullCost + rzaPlannedProfit;
        const rzaNdsAmount = (rzaWholesalePrice * rzaCalculationData.ndsPercentage) / 100;
        rzaFinalPrice = rzaWholesalePrice + rzaNdsAmount;
      }

      const totalWithQuantity = (finalPrice + rzaFinalPrice) * (cell.count || 1);
      setTotal(totalWithQuantity);
    };

    calculateTotal();
  }, [
    cell.breaker,
    cell.rza,
    cell.meterType,
    cell.transformer,
    cell.count,
    calculations.cell,
    currentCalculation,
    selectedCalculationName,
    selectedGroupName,
    materials,
  ]);

  const renderSelectBlock = (
    field: keyof RusnCellType,
    label: string,
    materialType: keyof typeof materials,
    selectedId: string | undefined
  ) => {
    const materialList = materials[materialType];

    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <select
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={selectedId || ''}
          onChange={(e) => {
            const material = materialList.find((m) => m.id.toString() === e.target.value);
            if (material) {
              onUpdate(cell.id, field, {
                id: material.id.toString(),
                name: material.name,
                price: Number(material.price),
              });
            }
          }}
        >
          <option value="">Выберите {label.toLowerCase()}</option>
          {materialList.map((material) => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderQuantityBlock = () => {
    return (
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
    );
  };

  const renderActionButtons = () => {
    return (
      <div className="flex gap-2 ml-auto">
        {cell.purpose === 'Отходящая' && (
          <button
            onClick={() => {
              const newCell = {
                id: crypto.randomUUID(),
                purpose: 'Отходящая',
                cellType: cell.cellType,
                count: 1,
                totalPrice: 0,
              };
              const event = new CustomEvent('addCell', { detail: newCell });
              window.dispatchEvent(event);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + Добавить отходящую
          </button>
        )}
        <button
          onClick={() => onRemove(cell.id)}
          className="text-red-600 hover:text-red-800 text-sm font-bold"
          title="Удалить ячейку"
        >
          ✕
        </button>
      </div>
    );
  };

  const cellFields = CELL_CONFIG[cell.purpose as keyof typeof CELL_CONFIG] || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
        {/* Рендерим поля на основе конфигурации */}
        {cellFields.map(({ field, label, materialType }) =>
          renderSelectBlock(field, label, materialType, cell[field]?.id)
        )}

        {/* Поле количества для всех ячеек */}
        {renderQuantityBlock()}

        {/* Кнопки действий */}
        {renderActionButtons()}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">
                {selectedGroupName} {currentCalculation}
                {cell.breaker &&
                  ` Выключатель: ${
                    materials.breaker.find((m) => m.id.toString() === cell.breaker?.id)?.name
                  }`}
                {cell.rza &&
                  ` РЗА: ${materials.rza.find((m) => m.id.toString() === cell.rza?.id)?.name}`}
                {cell.transformer &&
                  ` Трансформатор: ${
                    materials.transformer.find((m) => m.id.toString() === cell.transformer?.id)
                      ?.name
                  }`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {cell.count || 1} шт.
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                <div className="flex flex-col items-end">
                  <span>{(total / (cell.count || 1)).toLocaleString('ru-RU')} ₸</span>
                  <span className="text-xs text-gray-500">
                    Итого: {total.toLocaleString('ru-RU')} ₸
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Детальная информация о расчетах */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
        {/* Калькуляция выключателя */}
        {calculations.cell.find((c) => c.name === currentCalculation) && (
          <BreakerCalculation
            cell={cell}
            materials={materials}
            calculation={calculations.cell.find((c) => c.name === currentCalculation)!}
          />
        )}

        {/* Калькуляция РЗА */}
        {cell.rza &&
          (() => {
            const rzaCalculation = calculations.cell.find((calc) =>
              calc.data?.cellConfig?.materials?.rza?.some((rzaItem) => rzaItem.id === cell.rza?.id)
            );
            if (!rzaCalculation) return null;
            return (
              <RzaCalculation cell={cell} materials={materials} calculation={rzaCalculation} />
            );
          })()}
      </div>
    </div>
  );
}
