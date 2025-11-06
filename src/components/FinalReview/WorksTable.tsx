'use client';

import React from 'react';
import type { WorkItem, WorksState } from '@/store/useWorksStore';

interface WorksTableProps {
  selected: WorksState['selected'];
  worksList: WorkItem[];
  businessTravelTotal?: number;
}

const formattedPrice = (num?: number) =>
  typeof num === 'number' ? num.toLocaleString('ru-RU') + ' ₸' : '—';

export default function WorksTable({ selected, worksList, businessTravelTotal = 0 }: WorksTableProps) {
  console.log('WorksTable: businessTravelTotal =', businessTravelTotal);
  console.log('WorksTable: selected works =', Object.keys(selected).filter(key => selected[key]?.checked));
  console.log('WorksTable: worksList =', worksList.map(w => w.name));
  console.log('WorksTable: worksList details =', worksList);
  
  // Получаем выбранные работы и сортируем их
  const chosen = worksList
    .filter((work) => selected[work.name]?.checked)
    .sort((a, b) => {
      // Работа фундамента всегда внизу
      if (a.name.includes('Монтаж фундамента')) return 1;
      if (b.name.includes('Монтаж фундамента')) return -1;
      // Остальные работы по алфавиту
      return a.name.localeCompare(b.name);
    });

  console.log('WorksTable: chosen works before adding business travel =', chosen.map(w => w.name));

  // Добавляем командировочные если есть сумма
  if (businessTravelTotal > 0) {
    chosen.push({
      name: 'Командировочные (вместе с проживанием)',
      price: businessTravelTotal,
      unit: 'раб',
      description: 'Командировочные расходы включая транспорт, проживание и суточные'
    });
    console.log('WorksTable: Добавлены командировочные расходы:', businessTravelTotal);
  }

  console.log('WorksTable: final chosen works =', chosen.map(w => w.name));

  const total = chosen.reduce(
    (sum, work) => {
      // Для всех работ сумма равна цене (количество всегда 1)
      return sum + (work.price || 0);
    },
    0
  );

  if (chosen.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Работы и транспортные расходы</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-[#8eba1e] text-white">
              <tr>
                <th className="p-4 text-left font-semibold">№</th>
                <th className="p-4 text-left font-semibold">Наименование</th>
                <th className="p-4 text-center font-semibold">Ед. изм.</th>
                <th className="p-4 text-center font-semibold">Кол-во</th>
                <th className="p-4 text-center font-semibold">Цена</th>
                <th className="p-4 text-center font-semibold">Сумма</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="border-b border-gray-100">
                <td className="p-4 text-center font-semibold">—</td>
                <td className="p-4 text-left font-medium">Работы не выбраны</td>
                <td className="p-4 text-center text-gray-600">—</td>
                <td className="p-4 text-center font-semibold">—</td>
                <td className="p-4 text-center text-gray-900 font-semibold">—</td>
                <td className="p-4 text-center text-gray-900 font-bold">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Работы и транспортные расходы</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-[#8eba1e] text-white">
            <tr>
              <th className="p-4 text-left font-semibold">№</th>
              <th className="p-4 text-left font-semibold">Наименование</th>
              <th className="p-4 text-center font-semibold">Ед. изм.</th>
              <th className="p-4 text-center font-semibold">Кол-во</th>
              <th className="p-4 text-center font-semibold">Цена</th>
              <th className="p-4 text-center font-semibold">Сумма</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {chosen.map((work, idx) => {
              // Для всех работ количество всегда 1, сумма равна цене
              const count = 1;
              const totalPrice = work.price || 0;
              
              return (
                <tr key={work.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-center font-semibold">{idx + 1}</td>
                  <td className="p-4 text-left font-medium">{work.name}</td>
                  <td className="p-4 text-center text-gray-600">{`${work.unit || 'раб'}.`}</td>
                  <td className="p-4 text-center font-semibold">{count}</td>
                  <td className="p-4 text-center text-gray-900 font-semibold">{formattedPrice(work.price)}</td>
                  <td className="p-4 text-center text-gray-900 font-bold">
                    {formattedPrice(totalPrice)}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-[#8eba1e]/10 font-bold border-t-2 border-[#8eba1e]">
              <td colSpan={5} className="text-right pr-4 p-4 text-lg">
                ВСЕГО:
              </td>
              <td className="text-right pr-4 p-4 text-lg text-gray-900">{formattedPrice(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
