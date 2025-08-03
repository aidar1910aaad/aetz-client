'use client';

import React from 'react';

interface EquipmentItem {
  name: string;
  price?: number;
  unit?: string;
}

interface Props {
  selected: Record<string, { checked: boolean; count: number }>;
  equipmentList: EquipmentItem[];
}

const formattedPrice = (num?: number) =>
  typeof num === 'number' ? num.toLocaleString('ru-RU') + ' ₸' : '—';

export default function AdditionalEquipmentTable({ selected, equipmentList }: Props) {
  // Выбранные из equipmentList
  const chosen = equipmentList.filter((item) => selected[item.name]?.checked);

  // Добавляем динамически выбранные шкафы (из CabinetCalculation), которых нет в equipmentList
  const dynamicChosen = Object.entries(selected)
    .filter(([name, val]) => val.checked && !chosen.some((item) => item.name === name) && val.price)
    .map(([name, val]) => ({
      name,
      price: val.price,
      unit: 'шт.',
    }));

  const allChosen = [...chosen, ...dynamicChosen];

  const total = allChosen.reduce(
    (sum, item) => sum + (item.price ? item.price * (selected[item.name]?.count || 1) : 0),
    0
  );

  if (allChosen.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Доп. оборудование</h2>
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
              <td className="text-left p-2">Оборудование не выбрано</td>
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
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Доп. оборудование</h2>
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
          {allChosen.map((item, idx) => {
            const count = selected[item.name]?.count || 1;
            return (
              <tr key={item.name}>
                <td className="p-2">{idx + 1}</td>
                <td className="text-left p-2">{item.name}</td>
                <td className="p-2">{item.unit || 'шт.'}</td>
                <td className="p-2">{count}</td>
                <td className="p-2">{formattedPrice(item.price)}</td>
                <td className="p-2">
                  {formattedPrice(item.price ? item.price * count : undefined)}
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
