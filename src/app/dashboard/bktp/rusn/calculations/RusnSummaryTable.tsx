import React from 'react';
import { RusnCell } from '@/store/useRusnStore';
import { RusnMaterials, formatCellDescription } from '@/utils/rusnMaterials';
import { useCellCalculation } from '@/hooks/useCellCalculation';

interface Props {
  cells: RusnCell[];
  materials: RusnMaterials;
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
}

// Компонент для отдельной ячейки в сводке
function SummaryCellItem({
  cell,
  materials,
  groupSlug,
  selectedGroupName,
  selectedCalculationName,
}: {
  cell: RusnCell;
  materials: RusnMaterials;
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
}) {
  const description = formatCellDescription(
    cell,
    materials,
    selectedGroupName,
    selectedCalculationName
  );

  const { total, isCalculating } = useCellCalculation({
    cell,
    materials,
    groupSlug,
    selectedGroupName,
    selectedCalculationName,
  });

  // Не показываем ячейки с нулевой стоимостью, если они не загружаются
  // ВРЕМЕННО: показываем все ячейки для отладки
  // if (total === 0 && !isCalculating) {
  //   return null;
  // }

  // Не показываем ячейки без выбранных материалов
  const hasSelectedMaterials = cell.breaker || cell.rza || cell.meterType || 
                              cell.transformerCurrent || cell.transformerVoltage || 
                              cell.transformerPower || cell.transformer;
  
  // ВРЕМЕННО: показываем все ячейки для отладки
  // if (!hasSelectedMaterials) {
  //   return null;
  // }

  // Для КСО 366 ШМР создаем отдельные строки
  if (cell.cellType === 'Камера КСО 366 ШМР 14, 15' && cell.calculationBreakdown && Array.isArray(description)) {
    return (
      <>
        {/* Основная часть - камера КСО 366-14, 15 */}
        <tr className="border-b border-gray-100 hover:bg-gray-50">
          <td className="px-6 py-4 text-sm text-gray-900">{description[0]}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
            {cell.calculationBreakdown.main.price.toLocaleString('ru-RU')} ₸
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
            2
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
            {(cell.calculationBreakdown.main.price * 2).toLocaleString('ru-RU')} ₸
          </td>
        </tr>
        {/* Дополнительная часть - шинный мост */}
        <tr className="border-b border-gray-100 hover:bg-gray-50">
          <td className="px-6 py-4 text-sm text-gray-900">{description[1]}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
            {cell.calculationBreakdown.additional.price.toLocaleString('ru-RU')} ₸
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
            {cell.count || 1}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
            {(cell.calculationBreakdown.additional.price * (cell.count || 1)).toLocaleString('ru-RU')} ₸
          </td>
        </tr>
      </>
    );
  }

  // Обычная логика для одной строки
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">{description}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
        {((total || 0) / (cell.count || 1)).toLocaleString('ru-RU')} ₸
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
        {cell.count || 1}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
        {isCalculating ? (
          <div className="flex items-center justify-end gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-1">
              <div className="bg-[#8eba1e] h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <span className="text-xs text-[#8eba1e]">Загрузка...</span>
          </div>
        ) : (
          `${(total || 0).toLocaleString('ru-RU')} ₸`
        )}
      </td>
    </tr>
  );
}

// Компонент для расчета стоимости одной ячейки и передачи в общий тотал
function CellTotalCalculator({
  cell,
  materials,
  groupSlug,
  selectedGroupName,
  selectedCalculationName,
  onTotalCalculated,
}: {
  cell: RusnCell;
  materials: RusnMaterials;
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
  onTotalCalculated: (cellId: string, total: number) => void;
}) {
  const { total } = useCellCalculation({
    cell,
    materials,
    groupSlug,
    selectedGroupName,
    selectedCalculationName,
  });

  React.useEffect(() => {
    // Для КСО 366 ШМР используем calculationBreakdown.total если есть
    let cellTotal = total;
    if (cell.cellType === 'Камера КСО 366 ШМР 14, 15' && cell.calculationBreakdown) {
      cellTotal = cell.calculationBreakdown.total;
    }
    
    onTotalCalculated(cell.id, cellTotal);
  }, [cell.id, total, cell.calculationBreakdown, cell.cellType, onTotalCalculated]);

  return null;
}

// Компонент для отображения итоговой строки
function TotalRow({
  cells,
  materials,
  groupSlug,
  selectedGroupName,
  selectedCalculationName,
}: {
  cells: RusnCell[];
  materials: RusnMaterials;
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
}) {
  const [cellTotals, setCellTotals] = React.useState<Record<string, number>>({});

  // Очищаем cellTotals от несуществующих ячеек при изменении списка cells
  React.useEffect(() => {
    const currentCellIds = new Set(cells.map(cell => cell.id));
    setCellTotals(prev => {
      const filtered = Object.fromEntries(
        Object.entries(prev).filter(([cellId]) => currentCellIds.has(cellId))
      );
      // Обновляем только если есть изменения
      if (Object.keys(filtered).length !== Object.keys(prev).length) {
        return filtered;
      }
      return prev;
    });
  }, [cells.map(cell => cell.id).join(',')]); // Используем строку ID для стабильности

  const handleTotalCalculated = React.useCallback((cellId: string, total: number) => {
    setCellTotals((prev) => {
      // Проверяем, изменилось ли значение, чтобы избежать ненужных обновлений
      if (prev[cellId] === total) {
        return prev;
      }
      
      // Если total равен 0, удаляем ячейку из cellTotals
      if (total === 0) {
        const newTotals = { ...prev };
        delete newTotals[cellId];
        return newTotals;
      }
      
      // Иначе обновляем значение
      return {
        ...prev,
        [cellId]: total,
      };
    });
  }, []);

  const totalMaterialsCost = Object.values(cellTotals).reduce((sum, total) => sum + total, 0);
  
  // Проверяем, есть ли ячейки в процессе загрузки по количеству ячеек vs загруженных
  const hasCalculatingCells = cells.length > Object.keys(cellTotals).length;

  return (
    <>
      {cells.map((cell) => (
        <CellTotalCalculator
          key={`total-${cell.id}`}
          cell={cell}
          materials={materials}
          groupSlug={groupSlug}
          selectedGroupName={selectedGroupName}
          selectedCalculationName={selectedCalculationName}
          onTotalCalculated={handleTotalCalculated}
        />
      ))}
      <tr className="bg-[#8eba1e]/10 font-bold border-t-2 border-[#8eba1e]">
        <td className="px-6 py-4 text-sm text-gray-900" colSpan={3}>
          Итого по материалам:
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 text-right">
          {hasCalculatingCells ? (
            <div className="flex items-center justify-end gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-1">
                <div className="bg-[#8eba1e] h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <span className="text-xs text-[#8eba1e]">Загрузка...</span>
            </div>
          ) : (
            `${totalMaterialsCost.toLocaleString('ru-RU')} ₸`
          )}
        </td>
      </tr>
    </>
  );
}

export default function RusnSummaryTable({
  cells,
  materials,
  groupSlug,
  selectedGroupName,
  selectedCalculationName,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Сводка по материалам</h3>
        <button 
          onClick={() => {
            console.log('🧹 Clearing all cellSummaries from RusnSummaryTable');
            // Здесь нужно получить доступ к store
          }}
          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Очистить все
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#8eba1e] text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Наименование
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold">
                Цена
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold">
                Кол-во
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold">
                Сумма
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {cells.map((cell) => (
              <SummaryCellItem
                key={cell.id}
                cell={cell}
                materials={materials}
                groupSlug={groupSlug}
                selectedGroupName={selectedGroupName}
                selectedCalculationName={selectedCalculationName}
              />
            ))}
            <TotalRow
              cells={cells}
              materials={materials}
              groupSlug={groupSlug}
              selectedGroupName={selectedGroupName}
              selectedCalculationName={selectedCalculationName}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
