'use client';

import React from 'react';
import type { WorkItem, WorksState } from '@/store/useWorksStore';

interface WorksTableProps {
  selected: WorksState['selected'];
  worksList: WorkItem[];
}

const formattedPrice = (num?: number) =>
  typeof num === 'number' ? num.toLocaleString('ru-RU') + ' ₸' : '—';

export default function WorksTable({ selected, worksList }: WorksTableProps) {
  // Получаем выбранные работы
  const chosen = worksList.filter((work) => selected[work.name]?.checked);

  const total = chosen.reduce(
    (sum, work) => sum + (work.price ? work.price * (selected[work.name]?.count || 1) : 0),
    0
  );

  if (chosen.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Работы и транспортные расходы</h2>
        <table className="w-full table-auto border text-sm">
          <thead className="bg-[#3A55DF] text-white">
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
              <td className="p-2">—</td>
              <td className="text-left p-2">Работы не выбраны</td>
              <td className="p-2">—</td>
              <td className="p-2">—</td>
              <td className="p-2">—</td>
              <td className="p-2">—</td>
            </tr>
          </tbody>
        </table>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Работы и транспортные расходы</h2>
      <table className="w-full table-auto border text-sm">
        <thead className="bg-[#3A55DF] text-white">
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
          {chosen.map((work, idx) => {
            const count = selected[work.name]?.count || 1;
            return (
              <tr key={work.name}>
                <td className="p-2">{idx + 1}</td>
                <td className="text-left p-2">{work.name}</td>
                <td className="p-2">{work.unit || 'раб.'}</td>
                <td className="p-2">{count}</td>
                <td className="p-2">{formattedPrice(work.price)}</td>
                <td className="p-2">
                  {formattedPrice(work.price ? work.price * count : undefined)}
                </td>
              </tr>
            );
          })}
          <tr className="bg-[#f3f4f6] font-semibold">
            <td colSpan={5} className="text-right pr-4">
              ВСЕГО:
            </td>
            <td className="text-right pr-4">{formattedPrice(total)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
