'use client';

import { FaRegBuilding } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getCalculationsByGroup, type Calculation } from '@/api/calculations';
import CabinetCalculation from './CabinetCalculation';

interface CabinetsSectionProps {
  open: boolean;
  onToggle: () => void;
  search: string;
}

export default function CabinetsSection({ open, onToggle }: CabinetsSectionProps) {
  const [calculations, setCalculations] = useState<Calculation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем калькуляции для группы шкафов
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Получаем токен из localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен не найден. Требуется авторизация.');
        }

        // Используем slug группы шкафов
        const groupSlug = 'shkafy-dlya-dop-komplektacii';
        const data = await getCalculationsByGroup(groupSlug, token);
        setCalculations(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <FaRegBuilding className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Шкафы</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {loading
              ? 'Загрузка...'
              : calculations
              ? `${calculations.length} калькуляций`
              : 'Нет данных'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[2000px] py-4' : 'max-h-0 py-0'
        }`}
      >
        <div className="px-4">
          {/* Отображение состояния загрузки и ошибок */}
          {loading && (
            <div className="text-center py-4">
              <div className="text-blue-600">Загрузка калькуляций шкафов от API...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <div className="text-red-600">Ошибка: {error}</div>
            </div>
          )}

          {/* Отображение калькуляций */}
          {calculations && calculations.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {calculations.map((calculation) => (
                <CabinetCalculation key={calculation.id} calculation={calculation} />
              ))}
            </div>
          )}

          {/* Сообщение если нет данных */}
          {calculations && calculations.length === 0 && (
            <div className="text-center py-4">
              <div className="text-gray-500">Нет калькуляций для отображения</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
