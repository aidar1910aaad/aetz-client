'use client';

import { useBmzStore } from '@/store/useBmzStore';

interface BmzInstallationTableProps {
  isVisible: boolean;
}

export default function BmzInstallationTable({ isVisible }: BmzInstallationTableProps) {
  const bmzStore = useBmzStore();
  
  // Получаем количество блоков из БМЗ проекта
  const blockCount = bmzStore.blockCount || 0;
  
  // Цены за монтаж (из изображения)
  const priceUpTo6Blocks = 56595; // Цена за монтаж каждого блока до 6 блоков
  const priceOver6Blocks = 43535; // Цена за каждый последующий блок свыше 6 блоков
  
  // Цены за контуры заземления
  const externalGroundingPriceUpTo6 = 41358; // Внешний контур заземления до 6 блоков
  const externalGroundingPriceOver6 = 28297; // Внешний контур заземления свыше 6 блоков
  const internalGroundingPrice = 87000; // Внутренний контур заземления
  const cableRacksPrice = 163260; // Монтаж кабельных металлических стоек и полок
  
  // Расчет стоимости монтажа
  const calculateInstallationCost = () => {
    if (blockCount <= 0) return 0;
    
    if (blockCount <= 6) {
      return blockCount * priceUpTo6Blocks;
    } else {
      const costForFirst6 = 6 * priceUpTo6Blocks;
      const costForRemaining = (blockCount - 6) * priceOver6Blocks;
      return costForFirst6 + costForRemaining;
    }
  };
  
  // Расчет стоимости внешнего контура заземления
  const calculateExternalGroundingCost = () => {
    if (blockCount <= 0) return 0;
    
    if (blockCount <= 6) {
      return blockCount * externalGroundingPriceUpTo6;
    } else {
      const costForFirst6 = 6 * externalGroundingPriceUpTo6;
      const costForRemaining = (blockCount - 6) * externalGroundingPriceOver6;
      return costForFirst6 + costForRemaining;
    }
  };
  
  const totalCost = calculateInstallationCost();
  const externalGroundingTotal = calculateExternalGroundingCost();
  const internalGroundingTotal = internalGroundingPrice;
  const cableRacksTotal = cableRacksPrice;
  const totalGroundingCost = externalGroundingTotal + internalGroundingTotal + cableRacksTotal;
  const grandTotal = totalCost + totalGroundingCost;
  
  if (!isVisible || blockCount === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Монтаж БМЗ ({blockCount} блоков)
      </h3>
      
      <div className="space-y-6">
        {/* Таблица монтажа блоков */}
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
              {blockCount <= 6 ? (
                <tr>
                  <td className="px-4 py-3 text-gray-900">
                    Цена за монтаж каждого блока (до 6 блоков)
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">{blockCount}</td>
                  <td className="px-4 py-3 text-center text-gray-900">
                    {priceUpTo6Blocks.toLocaleString()} тг
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {(blockCount * priceUpTo6Blocks).toLocaleString()} тг
                  </td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">
                      Цена за монтаж каждого блока (до 6 блоков)
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">6</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {priceUpTo6Blocks.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {(6 * priceUpTo6Blocks).toLocaleString()} тг
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">
                      Каждый последующий блок свыше 6 блоков
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">{blockCount - 6}</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {priceOver6Blocks.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {((blockCount - 6) * priceOver6Blocks).toLocaleString()} тг
                    </td>
                  </tr>
                </>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                  Итого монтаж блоков:
                </td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">
                  {totalCost.toLocaleString()} тг
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Таблица контуров заземления */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Контуры заземления</h4>
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
                {/* Внешний контур заземления */}
                {blockCount <= 6 ? (
                  <tr>
                    <td className="px-4 py-3 text-gray-900">
                      Внешний контур заземления (до 6 блоков)
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">{blockCount}</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {externalGroundingPriceUpTo6.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {(blockCount * externalGroundingPriceUpTo6).toLocaleString()} тг
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <td className="px-4 py-3 text-gray-900">
                        Внешний контур заземления (до 6 блоков)
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">6</td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {externalGroundingPriceUpTo6.toLocaleString()} тг
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-900">
                        {(6 * externalGroundingPriceUpTo6).toLocaleString()} тг
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-900">
                        Внешний контур заземления (свыше 6 блоков)
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">{blockCount - 6}</td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {externalGroundingPriceOver6.toLocaleString()} тг
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-900">
                        {((blockCount - 6) * externalGroundingPriceOver6).toLocaleString()} тг
                      </td>
                    </tr>
                  </>
                )}
                
                {/* Внутренний контур заземления */}
                <tr>
                  <td className="px-4 py-3 text-gray-900">
                    Внутренний контур заземления
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">1</td>
                  <td className="px-4 py-3 text-center text-gray-900">
                    {internalGroundingPrice.toLocaleString()} тг
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {internalGroundingTotal.toLocaleString()} тг
                  </td>
                </tr>

                {/* Монтаж кабельных металлических стоек и полок */}
                <tr>
                  <td className="px-4 py-3 text-gray-900">
                    Монтаж кабельных металлических стоек и полок
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">1</td>
                  <td className="px-4 py-3 text-center text-gray-900">
                    {cableRacksPrice.toLocaleString()} тг
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {cableRacksTotal.toLocaleString()} тг
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                    Итого контуры заземления:
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900">
                    {totalGroundingCost.toLocaleString()} тг
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Общий итог БМЗ */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900">Общий итог БМЗ</h4>
              <p className="text-sm text-gray-600">
                Монтаж блоков + контуры заземления
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-600">
                {grandTotal.toLocaleString()} тг
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Автоматический расчет:</strong> Количество блоков ({blockCount}) взято из проекта БМЗ
        </p>
      </div>
    </div>
  );
} 
