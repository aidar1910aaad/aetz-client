'use client';

import React from 'react';

type Props = {
  transformer: {
    model: ReactNode;
    spec: string;
    price: number;
    quantity: number;
  } | null;
};

const formattedPrice = (num?: number) => (num ? num.toLocaleString('ru-RU') + ' тг' : '—');

export default function TransformerSection({ transformer }: Props) {
  if (!transformer) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Трансформатор</h2>
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
              <td className="p-2">1</td>
              <td className="text-left p-2">Трансформатор не выбран</td>
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

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Трансформатор</h2>
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
            <td className="p-2">1</td>
            <td className="text-left p-2">{transformer.model}</td>
            <td className="p-2">шт</td>
            <td className="p-2">{transformer.quantity}</td>
            <td className="p-2">{formattedPrice(transformer.price)}</td>
            <td className="p-2">{formattedPrice(transformer.price * transformer.quantity)}</td>
          </tr>
          <tr className="bg-[#f3f4f6] font-semibold">
            <td colSpan={5} className="text-right pr-4">
              ВСЕГО:
            </td>
            <td className="text-right pr-4">
              {formattedPrice(transformer.price * transformer.quantity)}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
