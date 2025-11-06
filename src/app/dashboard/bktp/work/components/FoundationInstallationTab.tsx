'use client';

import { useBmzStore } from '@/store/useBmzStore';

interface FoundationInstallationTabProps {
  isVisible: boolean;
}

export default function FoundationInstallationTab({ isVisible }: FoundationInstallationTabProps) {
  const bmzStore = useBmzStore();
  
  // Получаем длину и ширину из BMZ store (в миллиметрах)
  const lengthMm = bmzStore.length || 0;
  const widthMm = bmzStore.width || 0;
  
  // Конвертируем в квадратные метры
  const areaM2 = lengthMm > 0 && widthMm > 0 
    ? Math.round((lengthMm * widthMm) / 1000000 * 100) / 100 // мм² в м² с округлением до 2 знаков
    : 1; // По умолчанию 1 м² если нет данных
  
  // Фиксированная цена за м²
  const workPricePerM2 = 50000;
  const totalWorkCost = areaM2 * workPricePerM2;

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Монтаж фундамента ({areaM2} м²)
      </h3>
      
      <div className="space-y-6">
        {/* Параметры расчета */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Площадь фундамента (м²)
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700">
              {areaM2} м²
              {lengthMm > 0 && widthMm > 0 && (
                <span className="block text-xs text-gray-500 mt-1">
                  ({lengthMm} мм × {widthMm} мм)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Таблица расчета */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Описание</th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">Количество</th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">Цена за единицу</th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-gray-900">
                  Монтаж фундамента (с материалами) за м²
                </td>
                <td className="px-4 py-3 text-center text-gray-900">{areaM2}</td>
                <td className="px-4 py-3 text-center text-gray-900">
                  {workPricePerM2.toLocaleString()} ₸
                </td>
                <td className="px-4 py-3 text-center font-medium text-gray-900">
                  {totalWorkCost.toLocaleString()} ₸
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                  Итого:
                </td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">
                  {totalWorkCost.toLocaleString()} ₸
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Автоматический расчет:</strong> Площадь фундамента ({areaM2} м²) × Цена за м² ({workPricePerM2.toLocaleString()} ₸) = {totalWorkCost.toLocaleString()} ₸
            {lengthMm > 0 && widthMm > 0 && (
              <span className="block mt-1 text-xs text-blue-600">
                Размеры из проекта БМЗ: {lengthMm} мм × {widthMm} мм
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
