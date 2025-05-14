'use client';

import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';

const sections = [
  {
    title: 'Среднее напряжение',
    rows: [
      { name: 'Узел силового трансформатора УСТ-(6)10кВ (кабель, шина)', unit: 'м' },
      { name: 'Шинный мост (6)10кВ', unit: 'м' },
    ],
  },
  {
    title: 'Низкое напряжение',
    rows: [
      { name: 'Шинный мост 0,4кВ', defaultValue: '1200', hasYesNo: true },
      { name: 'Торцевая панель', hasYesNo: true },
      { name: 'Сборные шины ЩО 70', hasYesNo: true },
      { name: 'Шина N ЩО 70', hasYesNo: true },
      { name: 'Узел силового трансформатора УСТ-0,4кВ', hasYesNo: true },
    ],
  },
  {
    title: 'Шкафы',
    rows: [
      { name: 'Шинный мост ДГУ', hasYesNo: true },
      { name: 'Торцевая панель', hasYesNo: true },
      { name: 'Сборные шины ДГУ', hasYesNo: true },
      { name: 'Шина N ДГУ', hasYesNo: true },
      { name: 'Узел ДГУ', hasYesNo: true },
    ],
  },
];

export default function AdditionalEquipmentPage() {
  const [values, setValues] = useState<Record<string, any>>({});

  const handleChange = (key: string, field: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-6">Дополнительное оборудование</h1>
      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-semibold mb-4 border-b pb-1 text-gray-700">
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.rows.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded shadow-sm border"
                >
                  <div className="flex-1 text-sm font-medium text-gray-800">{row.name}</div>
                  <div className="min-w-[120px]">
                    {row.unit ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={values[row.name]?.value || ''}
                          onChange={(e) => handleChange(row.name, 'value', e.target.value)}
                          className="border px-3 py-1 rounded w-full text-sm"
                        />
                        <span className="text-sm text-gray-500">{row.unit}</span>
                      </div>
                    ) : row.defaultValue ? (
                      <input
                        type="text"
                        value={values[row.name]?.value || row.defaultValue}
                        onChange={(e) => handleChange(row.name, 'value', e.target.value)}
                        className="border px-3 py-1 rounded w-full text-sm"
                      />
                    ) : null}
                  </div>
                  {row.hasYesNo && (
                    <div className="flex gap-4 text-sm">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`${row.name}-yesno`}
                          checked={values[row.name]?.choice === 'Да'}
                          onChange={() => handleChange(row.name, 'choice', 'Да')}
                        />
                        Да
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`${row.name}-yesno`}
                          checked={values[row.name]?.choice === 'Нет'}
                          onChange={() => handleChange(row.name, 'choice', 'Нет')}
                        />
                        Нет
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
