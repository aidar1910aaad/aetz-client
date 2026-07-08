'use client';

import React, { useMemo } from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { resolveSummaryToCellId } from '@/domain/rusn/cellSummary';
import { useDebugPanelsEnabled } from '@/components/common/DebugToggle';
import { getCellTypesForGroup } from '@/config/cellTypeConfigs';
import { RUSN_CELL_PURPOSE } from '@/domain/rusn/rusnConstants';

interface RusnMaterialsSummaryProps {
  title?: string;
  showClearButton?: boolean;
}

/**
 * Порядок ячеек в сводке = как секции на странице РУСН:
 * типы из getCellTypesForGroup, но «Отходящая» после остальных
 * (как в RusnCellTable), внутри типа — порядок cellConfigs.
 * Затем сборные шины, затем шинный мост.
 */
function getRusnPageCellPurposeOrder(bodyType: string): string[] {
  const cellTypes = getCellTypesForGroup(bodyType || 'Камера КСО А12-10');
  const staticTypes = cellTypes.filter((type) => type !== RUSN_CELL_PURPOSE.OUTGOING);
  return cellTypes.includes(RUSN_CELL_PURPOSE.OUTGOING)
    ? [...staticTypes, RUSN_CELL_PURPOSE.OUTGOING]
    : staticTypes;
}

export default function RusnMaterialsSummary({
  title = 'Сводка по материалам',
  showClearButton = true,
}: RusnMaterialsSummaryProps) {
  const cellSummaries = useRusnStore((s) => s.cellSummaries);
  const cellConfigs = useRusnStore((s) => s.cellConfigs);
  const bodyType = useRusnStore((s) => s.global.bodyType);
  const busbarSummary = useRusnStore((s) => s.busbarSummary);
  const busBridgeSummaries = useRusnStore((s) => s.busBridgeSummaries);
  const removeCellSummary = useRusnStore((s) => s.removeCellSummary);
  const clearCellSummaries = useRusnStore((s) => s.clearCellSummaries);
  const clearOldKso366Summaries = useRusnStore((s) => s.clearOldKso366Summaries);
  const { enabled: debugPanelsEnabled } = useDebugPanelsEnabled();
  const [key, setKey] = React.useState(0);

  const validCellIds = useMemo(() => new Set(cellConfigs.map((cell) => cell.id)), [cellConfigs]);

  const filteredSummaries = useMemo(() => {
    const purposeOrder = getRusnPageCellPurposeOrder(bodyType);
    const purposeRank = new Map(purposeOrder.map((purpose, index) => [purpose, index]));
    const cellIndexById = new Map(cellConfigs.map((cell, index) => [cell.id, index]));
    const cellById = new Map(cellConfigs.map((cell) => [cell.id, cell]));

    return cellSummaries
      .filter((cellSummary) => {
        const isOldKso366Entry = cellSummary.name.includes(
          'Ячейка Секционный разьединитель Камера КСО 366'
        );
        if (isOldKso366Entry) return false;

        return validCellIds.has(resolveSummaryToCellId(cellSummary.cellId));
      })
      .sort((a, b) => {
        const aCellId = resolveSummaryToCellId(a.cellId);
        const bCellId = resolveSummaryToCellId(b.cellId);
        const aCell = cellById.get(aCellId);
        const bCell = cellById.get(bCellId);

        const aPurposeRank = purposeRank.get(aCell?.purpose || '') ?? Number.MAX_SAFE_INTEGER;
        const bPurposeRank = purposeRank.get(bCell?.purpose || '') ?? Number.MAX_SAFE_INTEGER;
        if (aPurposeRank !== bPurposeRank) return aPurposeRank - bPurposeRank;

        const aCellIndex = cellIndexById.get(aCellId) ?? Number.MAX_SAFE_INTEGER;
        const bCellIndex = cellIndexById.get(bCellId) ?? Number.MAX_SAFE_INTEGER;
        if (aCellIndex !== bCellIndex) return aCellIndex - bCellIndex;

        return a.cellId.localeCompare(b.cellId);
      });
  }, [cellSummaries, cellConfigs, validCellIds, bodyType]);

  const busbarSummaries = [];

  if (busbarSummary) {
    busbarSummaries.push({
      cellId: 'busbar_main',
      name: busbarSummary.name,
      quantity: busbarSummary.quantity,
      pricePerUnit: busbarSummary.pricePerUnit,
      totalPrice: busbarSummary.totalPrice,
    });
  }

  if (busBridgeSummaries && busBridgeSummaries.length > 0) {
    busBridgeSummaries.forEach((bridgeSummary, index) => {
      if (bridgeSummary.totalPrice > 0) {
        busbarSummaries.push({
          cellId: `busbridge_${index}`,
          name: bridgeSummary.name,
          quantity: bridgeSummary.quantity,
          pricePerUnit: bridgeSummary.pricePerUnit,
          totalPrice: bridgeSummary.totalPrice,
        });
      }
    });
  }

  const allSummaries = [...filteredSummaries, ...busbarSummaries];

  return (
    <div key={key} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        {showClearButton && debugPanelsEnabled && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearOldKso366Summaries();
                setKey((prev) => prev + 1);
              }}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Очистить КСО 366
            </button>
            <button
              onClick={() => {
                const kso366Summaries = useRusnStore
                  .getState()
                  .cellSummaries.filter(
                    (summary) =>
                      summary.name.includes('Камера КСО 366') ||
                      summary.name.includes('Шинный мост с разъединителем')
                  );
                kso366Summaries.forEach((summary) => {
                  removeCellSummary(summary.cellId);
                });
                setKey((prev) => prev + 1);
              }}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              Удалить КСО 366
            </button>
            <button
              onClick={() => {
                clearCellSummaries();
                setKey((prev) => prev + 1);
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Очистить все
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#8eba1e] text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold">Наименование</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Цена</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Кол-во</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Сумма</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {allSummaries.map((summary) => (
              <tr key={summary.cellId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{summary.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {summary.pricePerUnit.toLocaleString('ru-RU')} ₸
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {summary.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {summary.totalPrice.toLocaleString('ru-RU')} ₸
                </td>
              </tr>
            ))}
            {allSummaries.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>
                  Настройте ячейки и сборные шины для отображения сводки
                </td>
              </tr>
            )}
            {allSummaries.length > 0 && (
              <tr className="bg-[#8eba1e]/10 font-bold border-t-2 border-[#8eba1e]">
                <td className="px-6 py-4 text-sm text-gray-900" colSpan={3}>
                  Итого по материалам:
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {allSummaries
                    .reduce((sum, summary) => sum + summary.totalPrice, 0)
                    .toLocaleString('ru-RU')}{' '}
                  ₸
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
