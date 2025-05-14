'use client';

import { BktpStore } from '@/store/useBktpStore'; // Типизация, если ты используешь типы
import React from 'react';

type Props = {
  bktp: ReturnType<typeof BktpStore>;
};

export default function HeaderInfo({ bktp }: Props) {
  return (
    <header className="border-b pb-4 mb-4">
      <h1 className="text-2xl font-bold text-[#3A55DF]">Спецификация оборудования</h1>
      <p className="text-gray-600">Объект: {bktp.client || '—'}</p>
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <div>Утверждаю: {bktp.executor || '—'}</div>
        <div>
          Дата: {bktp.date || '—'}
          <br />
          РАСЧЁТ №{bktp.taskNumber || '000-000'}
        </div>
      </div>
    </header>
  );
}
