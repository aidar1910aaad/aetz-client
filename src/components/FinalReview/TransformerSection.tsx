'use client';

import React from 'react';

type Transformer = {
  spec: string;
  price: number;
  quantity: number;
};

type Props = {
  transformer: Transformer;
};

const formattedPrice = (num?: number) => (num ? num.toLocaleString('ru-RU') + ' тг' : '—');

export default function TransformerSection({ transformer }: Props) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Силовой трансформатор</h2>
      <table className="w-full table-auto text-sm">
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
            <td className="p-2">3</td>
            <td className="text-left p-2">{transformer.spec}</td>
            <td>шт</td>
            <td>{transformer.quantity}</td>
            <td>{formattedPrice(transformer.price)}</td>
            <td>{formattedPrice(transformer.price * transformer.quantity)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
