'use client';

import React from 'react';
import UniversalTable from './UniversalTable';
import { rusnTableConfig } from './tableConfigs';
import { useRusnStore, RusnCell } from '@/store/useRusnStore';
import { useCellCalculation } from '@/hooks/useCellCalculation';
import { useRusnMaterials } from '@/hooks/useRusnMaterials';
import { formatCellDescription } from '@/utils/rusnMaterials';
import type { RusnState } from '@/store/useRusnStore';

interface RusnUniversalTableProps {
  voltage?: '10' | '20';
}

// Компонент для расчета стоимости ячейки
function CellCalculator({
  cell,
  onCalculated,
}: {
  cell: RusnCell;
  onCalculated: (total: number) => void;
}) {
  const { materials } = useRusnMaterials();
  const { total } = useCellCalculation({
    cell,
    materials,
    groupSlug: 'rusn',
    selectedGroupName: 'РУСН',
    selectedCalculationName: 'РУСН-10кВ',
  });

  React.useEffect(() => {
    onCalculated(total);
  }, [total, onCalculated]);

  return null;
}

export default function RusnUniversalTable({ voltage = '10' }: RusnUniversalTableProps) {
  const rusnData = useRusnStore();
  const [cellTotals, setCellTotals] = React.useState<Record<string, number>>({});
  const { materials } = useRusnMaterials();

  // Создаем модифицированную конфигурацию с правильными данными
  const modifiedConfig = React.useMemo(() => ({
    ...rusnTableConfig,
    title: `РУ-${voltage}кВ`,
    dataMapper: (data: RusnState) => {
      const { cellConfigs, cellSummaries, busbarSummary, busBridgeSummary, busBridgeSummaries } = data;
      const rows = [];
      let rowNumber = 1;

      // Приоритет: cellSummaries, fallback к cellConfigs
      if (cellSummaries && cellSummaries.length > 0) {
        // Используем готовые summary данные
        cellSummaries.forEach((cellSummary) => {
          rows.push({
            id: `cell-${rowNumber++}`,
            name: cellSummary.name,
            unit: 'шт',
            quantity: cellSummary.quantity,
            price: cellSummary.pricePerUnit,
            total: cellSummary.totalPrice,
          });
        });
      } else if (cellConfigs && cellConfigs.length > 0) {
        // Fallback: используем данные из cellConfigs с расчетами
        cellConfigs.forEach((cell) => {
          const description = formatCellDescription(cell, materials);
          const total = cellTotals[cell.id] || 0;
          const pricePerUnit = total > 0 ? total / (cell.count || 1) : 0;

          rows.push({
            id: `cell-${rowNumber++}`,
            name: description,
            unit: 'шт',
            quantity: cell.count || 1,
            price: pricePerUnit,
            total: total,
          });
        });
      }

      // Добавляем шинные мосты, если есть данные
      if (busBridgeSummaries && busBridgeSummaries.length > 0) {
        busBridgeSummaries.forEach((busBridgeSummary) => {
          rows.push({
            id: `busbridge-${rowNumber++}`,
            name: busBridgeSummary.name,
            unit: 'шт',
            quantity: busBridgeSummary.quantity,
            price: busBridgeSummary.pricePerUnit,
            total: busBridgeSummary.totalPrice,
          });
        });
      }

      // Добавляем сборные шины, если есть данные
      if (busbarSummary) {
        rows.push({
          id: `busbar-${rowNumber++}`,
          name: busbarSummary.name,
          unit: 'шт',
          quantity: busbarSummary.quantity,
          price: busbarSummary.pricePerUnit,
          total: busbarSummary.totalPrice,
        });
      }

      return rows;
    },
    emptyMessage: `РУСН-${voltage}кВ не предусмотрено`,
  }), [voltage, cellTotals, materials]);

  // Если нет данных, показываем пустое состояние
  if (
    (!rusnData.cellConfigs || rusnData.cellConfigs.length === 0) &&
    (!rusnData.cellSummaries || rusnData.cellSummaries.length === 0) &&
    !rusnData.busbarSummary &&
    !rusnData.busBridgeSummary &&
    (!rusnData.busBridgeSummaries || rusnData.busBridgeSummaries.length === 0)
  ) {
    return (
      <UniversalTable 
        config={{
          ...modifiedConfig,
          dataMapper: () => [],
        }}
        data={rusnData}
      />
    );
  }

  return (
    <>
      {/* Скрытые калькуляторы для ячеек */}
      {rusnData.cellConfigs && rusnData.cellConfigs.length > 0 && (!rusnData.cellSummaries || rusnData.cellSummaries.length === 0) && (
        <div style={{ display: 'none' }}>
          {rusnData.cellConfigs.map((cell) => (
            <CellCalculator
              key={cell.id}
              cell={cell}
              onCalculated={(total) => setCellTotals((prev) => ({ ...prev, [cell.id]: total }))}
            />
          ))}
        </div>
      )}

      <UniversalTable 
        config={modifiedConfig}
        data={rusnData}
      />
    </>
  );
}