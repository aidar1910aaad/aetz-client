'use client';

import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';

const workOptions = [
  'Проектирование и согласование с АО Астана-РЭК (ТП и РЗиА)',
  'Строительство фундамента (с материалами)',
  'Монтаж оборудования',
  'Пуско-наладочные работы',
  'Электро-техническая лаборатория',
  'Включение подстанции под напряжение',
  'Командировочные (вместе с проживанием)',
];

export default function WorkSelectionPage() {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleChange = (item: string, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [item]: value,
    }));
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-6">Работы</h1>
      <div className="space-y-4">
        {workOptions.map((item) => (
          <div
            key={item}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border rounded shadow-sm"
          >
            <span className="text-sm font-medium text-gray-800 flex-1">{item}</span>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name={item}
                  value="Да"
                  checked={selections[item] === 'Да'}
                  onChange={() => handleChange(item, 'Да')}
                />
                Да
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name={item}
                  value="Нет"
                  checked={selections[item] === 'Нет'}
                  onChange={() => handleChange(item, 'Нет')}
                />
                Нет
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
