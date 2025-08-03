'use client';

import React from 'react';
import { useRusnStore, RusnCell } from '@/store/useRusnStore';
import { formatPrice } from '@/utils/bmzCalculations';
import { useCellCalculation } from '@/hooks/useCellCalculation';
import { useRusnMaterials } from '@/hooks/useRusnMaterials';
import { formatCellDescription } from '@/utils/rusnMaterials';

interface RusnSectionProps {
  voltage?: '10' | '20';
}

const TABLE_HEADERS = ['№', 'Наименование', 'Ед. изм.', 'Кол-во', 'Цена', 'Сумма'];
const COLORS = {
  header: 'bg-[#3A55DF]',
  total: 'bg-[#f3f4f6]',
};

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

export default function RusnSection({ voltage = '10' }: RusnSectionProps) {
  const { cellConfigs, cellSummaries, busbarSummary, busBridgeSummary, busBridgeSummaries } =
    useRusnStore();
  const [cellTotals, setCellTotals] = React.useState<Record<string, number>>({});
  const { materials } = useRusnMaterials();

  // Отладочная информация
  console.log('RusnSection Debug:', {
    cellConfigs: cellConfigs?.length || 0,
    cellSummaries: cellSummaries?.length || 0,
    busbarSummary: !!busbarSummary,
    busBridgeSummary: !!busBridgeSummary,
    busBridgeSummaries: busBridgeSummaries?.length || 0,
    cellConfigsData: cellConfigs,
    cellSummariesData: cellSummaries,
    busbarSummaryData: busbarSummary,
    busBridgeSummaryData: busBridgeSummary,
    busBridgeSummariesData: busBridgeSummaries,
  });

  // Если нет данных, показываем пустую таблицу
  if (
    (!cellConfigs || cellConfigs.length === 0) &&
    (!cellSummaries || cellSummaries.length === 0) &&
    !busbarSummary &&
    !busBridgeSummary &&
    (!busBridgeSummaries || busBridgeSummaries.length === 0)
  ) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">РУСН-{voltage}кВ</h2>
        <table className="w-full table-auto border text-sm">
          <thead className={`${COLORS.header} text-white`}>
            <tr>
              <th className="p-2">№</th>
              <th className="p-2 text-left">Наименование</th>
              <th className="p-2">Ед. изм.</th>
              <th className="p-2">Кол-во</th>
              <th className="p-2">Цена</th>
              <th className="p-2">Сумма</th>
            </tr>
          </thead>
          <tbody className="text-center">
            <tr>
              <td className="p-2">1</td>
              <td className="text-left p-2">РУСН-{voltage}кВ не предусмотрено</td>
              <td className="p-2">шт</td>
              <td className="p-2">—</td>
              <td className="p-2">—</td>
              <td className="p-2">—</td>
            </tr>
          </tbody>
        </table>
      </section>
    );
  }

  // Подготавливаем данные для отображения
  const tableData = [];
  let rowNumber = 1;

  // Добавляем ячейки (приоритет cellSummaries, fallback к cellConfigs)
  if (cellSummaries && cellSummaries.length > 0) {
    // Используем готовые summary данные
    cellSummaries.forEach((cellSummary) => {
      tableData.push({
        id: rowNumber++,
        name: cellSummary.name,
        unit: 'шт',
        quantity: cellSummary.quantity,
        pricePerUnit: cellSummary.pricePerUnit,
        totalPrice: cellSummary.totalPrice,
      });
    });
  } else if (cellConfigs && cellConfigs.length > 0) {
    // Fallback: используем данные из cellConfigs с расчетами
    cellConfigs.forEach((cell) => {
      const description = formatCellDescription(cell, materials);
      const total = cellTotals[cell.id] || 0;
      const pricePerUnit = total > 0 ? total / (cell.count || 1) : 0;

      tableData.push({
        id: rowNumber++,
        name: description,
        unit: 'шт',
        quantity: cell.count || 1,
        pricePerUnit: pricePerUnit,
        totalPrice: total,
      });
    });
  }

  // Добавляем шинные мосты, если есть данные
  if (busBridgeSummaries && busBridgeSummaries.length > 0) {
    console.log('RusnSection - Добавляем шинные мосты:', busBridgeSummaries);
    busBridgeSummaries.forEach((busBridgeSummary) => {
      tableData.push({
        id: rowNumber++,
        name: busBridgeSummary.name,
        unit: 'шт',
        quantity: busBridgeSummary.quantity,
        pricePerUnit: busBridgeSummary.pricePerUnit,
        totalPrice: busBridgeSummary.totalPrice,
      });
    });
  } else {
    console.log('RusnSection - Шинные мосты не найдены:', { busBridgeSummaries });
  }

  // Добавляем сборные шины, если есть данные
  if (busbarSummary) {
    tableData.push({
      id: rowNumber++,
      name: busbarSummary.name,
      unit: 'шт',
      quantity: busbarSummary.quantity,
      pricePerUnit: busbarSummary.pricePerUnit,
      totalPrice: busbarSummary.totalPrice,
    });
  }

  // Рассчитываем общую сумму
  const totalSum = tableData.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <section>
      {/* Скрытые калькуляторы для ячеек */}
      {cellConfigs && cellConfigs.length > 0 && (!cellSummaries || cellSummaries.length === 0) && (
        <div style={{ display: 'none' }}>
          {cellConfigs.map((cell) => (
            <CellCalculator
              key={cell.id}
              cell={cell}
              onCalculated={(total) => setCellTotals((prev) => ({ ...prev, [cell.id]: total }))}
            />
          ))}
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-800 mb-2">РУСН-{voltage}кВ</h2>
      <table className="w-full table-auto border text-sm">
        <thead className={`${COLORS.header} text-white`}>
          <tr>
            {TABLE_HEADERS.map((header, index) => (
              <th key={index} className={`p-2 ${index === 1 ? 'text-left' : ''}`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-center">
          {tableData.map((item) => (
            <tr key={item.id}>
              <td className="p-2">{item.id}</td>
              <td className="text-left p-2 whitespace-pre-line">{item.name}</td>
              <td className="p-2">{item.unit}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">{item.totalPrice > 0 ? formatPrice(item.pricePerUnit) : '—'}</td>
              <td className="p-2">{item.totalPrice > 0 ? formatPrice(item.totalPrice) : '—'}</td>
            </tr>
          ))}
          <tr className={`${COLORS.total} font-semibold`}>
            <td colSpan={5} className="text-right pr-4">
              ВСЕГО:
            </td>
            <td className="text-right pr-4">{formatPrice(totalSum)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
