'use client';

import { useTransformerStore } from '@/store/useTransformerStore';

interface TransformerInstallationTableProps {
  isVisible: boolean;
}

export default function TransformerInstallationTable({ isVisible }: TransformerInstallationTableProps) {
  const transformerStore = useTransformerStore();
  const selectedTransformer = transformerStore.selectedTransformer;
  
  // Цены за монтаж трансформаторов (из изображения)
  const installationPrices = {
    630: 65310, // Мощность 630 кВА
    1000: 87070, // Мощность 1000-1600 кВА
    2500: 108840, // Мощность 2500-3150 кВА
  };
  
  // Определяем цену на основе мощности трансформатора
  const getInstallationPrice = (power: number) => {
    if (power <= 630) return installationPrices[630];
    if (power <= 1600) return installationPrices[1000];
    if (power <= 3150) return installationPrices[2500];
    return installationPrices[2500]; // Для больших мощностей используем максимальную цену
  };
  
  // Определяем диапазон мощности для отображения
  const getPowerRange = (power: number) => {
    if (power <= 630) return '630 кВА';
    if (power <= 1600) return '1000-1600 кВА';
    if (power <= 3150) return '2500-3150 кВА';
    return '2500-3150 кВА'; // Для больших мощностей
  };
  
  if (!isVisible || !selectedTransformer) {
    return null;
  }
  
  const { power, quantity } = selectedTransformer;
  const installationPrice = getInstallationPrice(power);
  const powerRange = getPowerRange(power);
  
  const installationTotal = installationPrice * quantity;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Монтаж трансформаторов ({quantity} шт., {power} кВА)
      </h3>
      
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
            {/* Монтаж трансформатора */}
            <tr>
              <td className="px-4 py-3 text-gray-900">
                Монтаж трансформатора (Мощность {powerRange})
              </td>
              <td className="px-4 py-3 text-center text-gray-900">{quantity}</td>
              <td className="px-4 py-3 text-center text-gray-900">
                {installationPrice.toLocaleString()} тг
              </td>
              <td className="px-4 py-3 text-center font-medium text-gray-900">
                {installationTotal.toLocaleString()} тг
              </td>
            </tr>
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                Итого:
              </td>
              <td className="px-4 py-3 text-center font-bold text-gray-900">
                {installationTotal.toLocaleString()} тг
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Автоматический расчет:</strong> Количество ({quantity} шт.) и мощность ({power} кВА) 
          взяты из выбранного трансформатора в проекте
        </p>
      </div>
    </div>
  );
} 