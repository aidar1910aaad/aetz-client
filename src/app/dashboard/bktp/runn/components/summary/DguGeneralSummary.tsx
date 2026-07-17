'use client';

import React, { useMemo } from 'react';
import { useDguStore } from '@/store/useDguStore';
import { formatCurrency } from '@/utils/calculationUtils';

export default function DguGeneralSummary() {
  const dgu = useDguStore();
  const { cellSummaries, busbarSummary, busBridgeSummaries, settings } = dgu;

  const uniqueCellSummaries = useMemo(() => {
    const byCellId = new Map<string, (typeof cellSummaries)[number]>();
    cellSummaries.forEach((summary) => {
      byCellId.set(summary.cellId, summary);
    });
    return Array.from(byCellId.values());
  }, [cellSummaries]);

  if (!dgu.enabled) {
    return null;
  }

  const hasRows =
    uniqueCellSummaries.length > 0 ||
    busbarSummary ||
    busBridgeSummaries.length > 0 ||
    (settings.price || 0) > 0;

  if (!hasRows) {
    return null;
  }

  const cellSum = uniqueCellSummaries.reduce((sum, s) => sum + s.totalPrice, 0);
  const busbarSum = busbarSummary ? busbarSummary.totalPrice : 0;
  const busBridgeSum = busBridgeSummaries.reduce((sum, s) => sum + s.totalPrice, 0);
  const settingsPrice = settings.price || 0;
  const totalSum = cellSum + busbarSum + busBridgeSum + settingsPrice;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Сводка ДГУ</h3>
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
            {uniqueCellSummaries.map((summary) => (
              <tr
                key={summary.cellId}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4 text-sm text-gray-900">{summary.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(summary.pricePerUnit)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {summary.quantity} шт.
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(summary.totalPrice)}
                </td>
              </tr>
            ))}

            {busBridgeSummaries.map((bridgeSummary, index) => (
              <tr
                key={`bridge-${index}`}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4 text-sm text-gray-900">{bridgeSummary.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(bridgeSummary.pricePerUnit)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {bridgeSummary.quantity} шт.
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(bridgeSummary.totalPrice)}
                </td>
              </tr>
            ))}

            {busbarSummary && (
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{busbarSummary.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(busbarSummary.pricePerUnit)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {busbarSummary.quantity} шт.
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(busbarSummary.totalPrice)}
                </td>
              </tr>
            )}

            {settingsPrice > 0 && (
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  ДГУ ({settings.nominalPowerKva} кВА)
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(settingsPrice)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">1 шт.</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(settingsPrice)}
                </td>
              </tr>
            )}

            <tr className="bg-[#8eba1e]/10 font-bold border-t-2 border-[#8eba1e]">
              <td className="px-6 py-4 text-sm text-gray-900" colSpan={3}>
                Общая стоимость:
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                {formatCurrency(totalSum)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
