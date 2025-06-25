'use client';

import { useEffect, useState } from 'react';

interface CellData {
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface CurrentRequest {
  cells: CellData[];
  totalSum: number;
}

export default function CurrentRequestPage() {
  const [requestData, setRequestData] = useState<CurrentRequest | null>(null);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadData = () => {
      const data = localStorage.getItem('currentRequest');
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.cells && Array.isArray(parsedData.cells)) {
            setRequestData(parsedData);
          }
        } catch (error) {
          console.error('Error parsing current request data:', error);
        }
      }
    };

    // Загружаем данные при монтировании
    loadData();

    // Добавляем слушатель изменений в localStorage
    window.addEventListener('storage', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, []);

  if (!requestData || !requestData.cells || requestData.cells.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Текущая заявка</h1>
        <p>Нет данных для отображения</p>
      </div>
    );
  }

  // Форматируем название ячейки для отображения
  const formatCellName = (name: string) => {
    // Убираем "Камера КСО А12-10" из начала названия
    const withoutPrefix = name.replace('Камера КСО А12-10', '').trim();
    // Форматируем компоненты
    return withoutPrefix
      .replace(/Выключатель:/g, '\nВыключатель:')
      .replace(/РЗА:/g, '\nРЗА:')
      .replace(/Счетчик:/g, '\nСчетчик:')
      .trim();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Спецификация оборудования</h1>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p><strong>Объект:</strong> 123</p>
          </div>
          <div>
            <p><strong>Дата:</strong> {currentDate}</p>
          </div>
        </div>
        <div className="mb-4">
          <p><strong>РАСЧЁТ №123</strong></p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">РУ-10кВ</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">№</th>
                <th className="px-4 py-2 text-left">Наименование</th>
                <th className="px-4 py-2 text-left">Ед. изм.</th>
                <th className="px-4 py-2 text-left">Кол-во</th>
                <th className="px-4 py-2 text-left">Цена</th>
                <th className="px-4 py-2 text-left">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {requestData.cells.map((cell, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 whitespace-pre-line">{formatCellName(cell.name)}</td>
                  <td className="px-4 py-2">шт</td>
                  <td className="px-4 py-2">{cell.quantity}</td>
                  <td className="px-4 py-2">{Math.round(cell.pricePerUnit).toLocaleString('ru-RU')} тг</td>
                  <td className="px-4 py-2">{Math.round(cell.totalPrice).toLocaleString('ru-RU')} тг</td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="px-4 py-2 text-right font-bold">Итого:</td>
                <td className="px-4 py-2 font-bold">{Math.round(requestData.totalSum).toLocaleString('ru-RU')} тг</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-[#2d48be]">
          Скачать Excel
        </button>
        <button className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-[#2d48be]">
          Скачать PDF
        </button>
        <button className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-[#2d48be]">
          Сохранить
        </button>
      </div>
    </div>
  );
} 