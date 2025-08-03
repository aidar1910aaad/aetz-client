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

  const { total } = useCellCalculation({
    cell,
    materials,
    groupSlug,
    selectedGroupName,
    selectedCalculationName,
  });

  // Не показываем ячейки с нулевой стоимостью
  if (total === 0) {
    return null;
  }

  return (
    <tr>
      <td className="px-6 py-4 text-sm text-gray-900">{description}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
        {(total / (cell.count || 1)).toLocaleString('ru-RU')} ₸
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
        {cell.count || 1}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
        {total.toLocaleString('ru-RU')} ₸
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
    onTotalCalculated(cell.id, total);
  }, [cell.id, total, onTotalCalculated]);

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

  const handleTotalCalculated = React.useCallback((cellId: string, total: number) => {
    setCellTotals((prev) => ({
      ...prev,
      [cellId]: total,
    }));
  }, []);

  const totalMaterialsCost = Object.values(cellTotals).reduce((sum, total) => sum + total, 0);

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
      <tr className="bg-gray-50">
        <td className="px-6 py-4 text-sm font-medium text-gray-900" colSpan={3}>
          Итого по материалам:
        </td>
        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
          {totalMaterialsCost.toLocaleString('ru-RU')} ₸
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Сводка по материалам</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Наименование
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Кол-во
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
