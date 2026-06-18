'use client';

import { useRunnStore } from '@/store/useRunnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useWorkPricesStore } from '@/store/useWorkPricesStore';
import {
  calculateRunnInstallationCost,
  getRunnTransformerUnitPriceKey,
} from '@/utils/worksCalculationUtils';

interface RunnInstallationTableProps {
  isVisible: boolean;
}

export default function RunnInstallationTable({ isVisible }: RunnInstallationTableProps) {
  const runnStore = useRunnStore();
  const { selectedTransformer } = useTransformerStore();
  const workPrices = useWorkPricesStore();

  const panelCount = runnStore.cellConfigs.reduce(
    (total, cell) => total + (cell.quantity || 1),
    0
  );
  const busBridgeCount =
    runnStore.busBridges?.reduce((total, bridge) => total + (bridge.quantity || 1), 0) ||
    runnStore.busBridgeSummaries
      ?.filter((summary) => summary.name.toLowerCase().includes('шинный мост'))
      .reduce((total, bridge) => total + (bridge.quantity || 1), 0) ||
    0;
  const transformerQuantity = selectedTransformer?.quantity || 0;
  const transformerUnitPriceKey = getRunnTransformerUnitPriceKey(runnStore.busbarSummary?.name);
  const transformerUnitPrice = transformerUnitPriceKey
    ? Number(workPrices[transformerUnitPriceKey]) || 0
    : 0;

  if (!isVisible || panelCount === 0) return null;

  const installationTotal = calculateRunnInstallationCost(panelCount, workPrices);
  const shmTotal = busBridgeCount * workPrices.runnShmInstallation;
  const transformerUnitTotal = transformerQuantity * transformerUnitPrice;
  const grandTotal = installationTotal + shmTotal + transformerUnitTotal;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Монтаж РУНН ({panelCount} панелей)
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Описание</th>
              <th className="px-4 py-2 text-center font-medium text-gray-700">Количество</th>
              <th className="px-4 py-2 text-right font-medium text-gray-700">Цена за единицу</th>
              <th className="px-4 py-2 text-right font-medium text-gray-700">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {panelCount <= 7 ? (
              <tr>
                <td className="px-4 py-3 text-gray-900">Монтаж РУ-0,4 кВ до 7 панелей</td>
                <td className="px-4 py-3 text-center text-gray-900">{panelCount}</td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {workPrices.runnMountRu04UpTo7PerPanel.toLocaleString()} тг
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {installationTotal.toLocaleString()} тг
                </td>
              </tr>
            ) : (
              <>
                <tr>
                  <td className="px-4 py-3 text-gray-900">Монтаж РУ-0,4 кВ до 7 панелей</td>
                  <td className="px-4 py-3 text-center text-gray-900">7</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {workPrices.runnMountRu04UpTo7PerPanel.toLocaleString()} тг
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {(7 * workPrices.runnMountRu04UpTo7PerPanel).toLocaleString()} тг
                  </td>
                </tr>
                {panelCount > 7 && (
                  <tr>
                    <td className="px-4 py-3 text-gray-900">Свыше 7 до 9 панелей</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {Math.min(panelCount - 7, 2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {workPrices.runnMountRu048To9PerPanel.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {(Math.min(panelCount - 7, 2) * workPrices.runnMountRu048To9PerPanel).toLocaleString()} тг
                    </td>
                  </tr>
                )}
                {panelCount > 9 && (
                  <tr>
                    <td className="px-4 py-3 text-gray-900">Каждая панель свыше 9</td>
                    <td className="px-4 py-3 text-center text-gray-900">{panelCount - 9}</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {workPrices.runnMountRu04Over9PerPanel.toLocaleString()} тг
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {((panelCount - 9) * workPrices.runnMountRu04Over9PerPanel).toLocaleString()} тг
                    </td>
                  </tr>
                )}
              </>
            )}

            {busBridgeCount > 0 && (
              <tr>
                <td className="px-4 py-3 text-gray-900">Установка ШМ</td>
                <td className="px-4 py-3 text-center text-gray-900">{busBridgeCount}</td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {workPrices.runnShmInstallation.toLocaleString()} тг
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {shmTotal.toLocaleString()} тг
                </td>
              </tr>
            )}

            {transformerUnitPriceKey && transformerQuantity > 0 && (
              <tr>
                <td className="px-4 py-3 text-gray-900">Узел силового трансформатора 0,4 кВ</td>
                <td className="px-4 py-3 text-center text-gray-900">{transformerQuantity}</td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {transformerUnitPrice.toLocaleString()} тг
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {transformerUnitTotal.toLocaleString()} тг
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                Итого:
              </td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">
                {grandTotal.toLocaleString()} тг
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
