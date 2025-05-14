'use client';

import React from 'react';

type Props = {
  total: number;
};

const formattedPrice = (num?: number) => (num ? num.toLocaleString('ru-RU') + ' тг' : '—');

export default function FooterTotal({ total }: Props) {
  return (
    <footer className="text-right text-xl font-bold text-[#3A55DF] mt-6">
      Итого: {formattedPrice(total)}
    </footer>
  );
}
