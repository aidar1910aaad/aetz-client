'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';

type Calculation = {
  id: number;
  title: string;
  description?: string;
  date?: string;
  status?: string;
};

export default function CalculationsPage() {
  const router = useRouter();

  const [calculations, setCalculations] = useState<Calculation[]>([]);

  useEffect(() => {
    const mock: Calculation[] = [
      {
        id: 1,
        title: 'КСО А12-10 1ВК',
        description: 'Плановая калькуляция КСО с вакуумным выключателем',
        date: '01.05.2025',
        status: 'Черновик',
      },
      {
        id: 2,
        title: 'Камера КСО 366',
        description: 'testtest',
        date: '26.04.2025',
        status: 'Готово',
      },
    ];
    setCalculations(mock);
  }, []);

  const handleAdd = () => {
    router.push('/dashboard/calc/new');
  };

  const handleOpen = (id: number) => {
    router.push(`/dashboard/calc/${id}`);
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-8 py-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Калькуляции</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#3A55DF] text-white px-5 py-2.5 rounded-lg hover:bg-[#2e46c5] transition"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Новая калькуляция</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculations.map((calc) => (
          <div
            key={calc.id}
            onClick={() => handleOpen(calc.id)}
            className="group cursor-pointer bg-white border border-gray-200 hover:border-[#3A55DF] shadow-sm hover:shadow-md rounded-xl p-6 transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-[#3A55DF]" />
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#3A55DF] transition">
                {calc.title}
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-3">{calc.description}</p>

            <div className="text-xs text-gray-500 group-hover:text-gray-700 transition">
              <p>Дата: {calc.date}</p>
              <p>Статус: {calc.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
