'use client';

import { AreaPriceRange } from '@/api/bmz';
import { normalizeAreaPriceRange } from '@/utils/bmzAreaPriceRange';

interface BmzAreaPriceTableProps {
  areaPriceRanges: AreaPriceRange[];
  onEdit: (price: AreaPriceRange) => void;
  onDelete: (index: number) => void;
}

export default function BmzAreaPriceTable({
  areaPriceRanges,
  onEdit,
  onDelete,
}: BmzAreaPriceTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Диапазоны цен</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Площадь (м²)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Высота (мм)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Толщина стен (мм)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена за м²
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {areaPriceRanges.map((price, index) => {
                const r = normalizeAreaPriceRange(price);
                return (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {r.minArea} – {r.maxArea}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {r.minHeight} – {r.maxHeight === 999999 ? '∞' : r.maxHeight}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {r.minWallThickness} – {r.maxWallThickness}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {price.pricePerSquareMeter.toLocaleString()} тг
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(r)}
                      className="text-[#8eba1e] hover:text-[#7aa31a] mr-4"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => onDelete(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
