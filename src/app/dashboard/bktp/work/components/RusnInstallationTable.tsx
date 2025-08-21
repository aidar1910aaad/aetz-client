'use client';

import { useRusnStore } from '@/store/useRusnStore';
import { useTransformerStore } from '@/store/useTransformerStore';

interface RusnInstallationTableProps {
  isVisible: boolean;
}

export default function RusnInstallationTable({ isVisible }: RusnInstallationTableProps) {
  const rusnStore = useRusnStore();
  const transformerStore = useTransformerStore();
  
  // Получаем данные из РУСН проекта
  const cellConfigs = rusnStore.cellConfigs || [];
  const busBridges = rusnStore.busBridges || [];
  
  // Получаем данные о трансформаторах
  const selectedTransformer = transformerStore.selectedTransformer;
  
  // Подсчитываем общее количество ячеек с учетом поля count каждой ячейки
  const totalCellCount = cellConfigs.reduce((total, cell) => total + (cell.count || 1), 0);
  
  // Подсчитываем общее количество шинных мостов
  const totalBusBridgeCount = busBridges.reduce((total, bridge) => total + (bridge.quantity || 1), 0);
  
  // Количество трансформаторов
  const transformerQuantity = selectedTransformer?.quantity || 0;
  
  // Цены за монтаж РУСН (из изображения)
  const priceUpTo6Cells = 60948; // Монтаж РУ-10\20 кВ с ШРЗ до 6 ячеек
  const price6To8Cells = 108840; // Свыше 6 ячеек до 8 ячеек
  const priceOver8Cells = 21770; // Каждая последующая добавленная свыше 8 ячеек
  const busBridgePrice = 100130; // Шинный мост монтаж и изготовление
  const busBridgeInstallationPrice = 25000; // Установка Шинного моста
  const transformerUnitPrice = 108840; // Узел силового трансформатора 10/20 кВ
  
  // Расчет стоимости монтажа
  const calculateInstallationCost = () => {
    if (totalCellCount <= 0) return 0;
    
    if (totalCellCount <= 6) {
      return totalCellCount * priceUpTo6Cells;
    } else if (totalCellCount <= 8) {
      const costForFirst6 = 6 * priceUpTo6Cells;
      const costForRemaining = (totalCellCount - 6) * price6To8Cells;
      return costForFirst6 + costForRemaining;
    } else {
      const costForFirst6 = 6 * priceUpTo6Cells;
      const costFor6To8 = 2 * price6To8Cells;
      const costForOver8 = (totalCellCount - 8) * priceOver8Cells;
      return costForFirst6 + costFor6To8 + costForOver8;
    }
  };
  
  if (!isVisible || totalCellCount === 0) {
    return null;
  }
  
  const installationTotal = calculateInstallationCost();
  const busBridgeTotal = busBridgePrice; // Всегда 1 шт.
  const busBridgeInstallationTotal = totalBusBridgeCount * busBridgeInstallationPrice;
  const transformerUnitTotal = transformerQuantity * transformerUnitPrice;
  const grandTotal = installationTotal + busBridgeTotal + busBridgeInstallationTotal + transformerUnitTotal;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Монтаж РУСН ({totalCellCount} ячеек)
      </h3>
      
      <div className="space-y-6">
        {/* Таблица монтажа ячеек */}
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
              {totalCellCount <= 6 ? (
                <tr>
                  <td className="px-4 py-3 text-gray-900">
                    Монтаж РУ-10\20 кВ с ШРЗ до 6 ячеек
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">{totalCellCount}</td>
                  <td className="px-4 py-3 text-center text-gray-900">
                    {priceUpTo6Cells.toLocaleString()} тг
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {(totalCellCount * priceUpTo6Cells).toLocaleString()} тг
                  </td>
                </tr>
              ) : totalCellCount <= 8 ? (
                <>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">
                      Монтаж РУ-10\20 кВ с ШРЗ до 6 ячеек
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">6</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {priceUpTo6Cells.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {(6 * priceUpTo6Cells).toLocaleString()} тг
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">
                      Свыше 6 ячеек до 8 ячеек
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">{totalCellCount - 6}</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {price6To8Cells.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {((totalCellCount - 6) * price6To8Cells).toLocaleString()} тг
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">
                      Монтаж РУ-10\20 кВ с ШРЗ до 6 ячеек
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">6</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {priceUpTo6Cells.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {(6 * priceUpTo6Cells).toLocaleString()} тг
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">
                      Свыше 6 ячеек до 8 ячеек
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">2</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {price6To8Cells.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {(2 * price6To8Cells).toLocaleString()} тг
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">
                      Каждая последующая добавленная свыше 8 ячеек
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">{totalCellCount - 8}</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {priceOver8Cells.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {((totalCellCount - 8) * priceOver8Cells).toLocaleString()} тг
                    </td>
                  </tr>
                </>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                  Итого монтаж ячеек:
                </td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">
                  {installationTotal.toLocaleString()} тг
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Таблица шинного моста */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Шинный мост</h4>
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
                    Шинный мост монтаж и изготовление (без металла, установка шины в корпус в т.ч. ДГУ)
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">1</td>
                  <td className="px-4 py-3 text-center text-gray-900">
                    {busBridgePrice.toLocaleString()} тг
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {busBridgeTotal.toLocaleString()} тг
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">
                    Установка Шинного моста
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">{totalBusBridgeCount}</td>
                  <td className="px-4 py-3 text-center text-gray-900">
                    {busBridgeInstallationPrice.toLocaleString()} тг
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {busBridgeInstallationTotal.toLocaleString()} тг
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                    Итого шинный мост:
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900">
                    {(busBridgeTotal + busBridgeInstallationTotal).toLocaleString()} тг
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Таблица трансформаторов */}
        {transformerQuantity > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Трансформаторы</h4>
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
                      Узел силового трансформатора 10/20 кВ
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">{transformerQuantity}</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {transformerUnitPrice.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {transformerUnitTotal.toLocaleString()} тг
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                      Итого трансформаторы:
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-900">
                      {transformerUnitTotal.toLocaleString()} тг
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Общий итог РУСН */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900">Общий итог РУСН</h4>
              <p className="text-sm text-gray-600">
                Монтаж ячеек + шинный мост + установка шинных мостов + трансформаторы
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
          <strong>Автоматический расчет:</strong> Количество ячеек ({totalCellCount}), шинных мостов ({totalBusBridgeCount}) 
          и трансформаторов ({transformerQuantity}) взято из проекта
        </p>
      </div>
    </div>
  );
} 