import { Material } from '@/api/material';
import { RusnCell as RusnCellType } from '@/store/useRusnStore';

interface MaterialsTableProps {
  category: {
    name: string;
    items: Array<{
      name: string;
      unit: string;
      price: number;
      quantity: number;
    }>;
  };
  cell: RusnCellType;
  materials: {
    breaker: Material[];
    rza: Material[];
  };
  showBreaker?: boolean;
  showRza?: boolean;
}

export default function MaterialsTable({
  category,
  cell,
  materials,
  showBreaker,
  showRza,
}: MaterialsTableProps) {
  // Рассчитываем итог по категории без выбранных материалов
  const categoryTotal = category.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <h4 className="text-lg font-medium text-gray-900 mb-4">{category.name}</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                Наименование
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Ед.</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Цена</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Кол-во</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {category.items.map((item, itemIndex) => (
              <tr key={itemIndex}>
                <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{item.unit}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right">
                  {item.price.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₸
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right">
                  {(item.price * item.quantity).toLocaleString('ru-RU', {
                    maximumFractionDigits: 2,
                  })}{' '}
                  ₸
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                Итого по категории:
              </td>
              <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                {categoryTotal.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₸
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Отдельная категория для выбранных материалов */}
      {(showBreaker && cell.breaker) || (showRza && cell.rza) ? (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Выбранные материалы</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Наименование
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Ед.</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Цена</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Кол-во</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {showBreaker && cell.breaker && (
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {materials.breaker.find((m) => m.id.toString() === cell.breaker?.id)?.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">шт</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {materials.breaker
                        .find((m) => m.id.toString() === cell.breaker?.id)
                        ?.price.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}{' '}
                      ₸
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">1</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {materials.breaker
                        .find((m) => m.id.toString() === cell.breaker?.id)
                        ?.price.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}{' '}
                      ₸
                    </td>
                  </tr>
                )}
                {showRza && cell.rza && (
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {materials.rza.find((m) => m.id.toString() === cell.rza?.id)?.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">шт</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {materials.rza
                        .find((m) => m.id.toString() === cell.rza?.id)
                        ?.price.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}{' '}
                      ₸
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">1</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {materials.rza
                        .find((m) => m.id.toString() === cell.rza?.id)
                        ?.price.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}{' '}
                      ₸
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50">
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                  >
                    Итого по выбранным материалам:
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                    {(
                      (showBreaker && cell.breaker
                        ? Number(
                            materials.breaker.find((m) => m.id.toString() === cell.breaker?.id)
                              ?.price || 0
                          )
                        : 0) +
                      (showRza && cell.rza
                        ? Number(
                            materials.rza.find((m) => m.id.toString() === cell.rza?.id)?.price || 0
                          )
                        : 0)
                    ).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}{' '}
                    ₸
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
