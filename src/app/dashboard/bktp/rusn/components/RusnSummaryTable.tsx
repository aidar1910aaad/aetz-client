import { Material } from '@/api/material';
import { RusnCell } from '@/store/useRusnStore';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';

interface Props {
  cells: RusnCell[];
  materials: {
    breaker: Material[];
    rza: Material[];
    meter: Material[];
  };
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
}

interface SummaryItem {
  name: string;
  price: number;
  count: number;
  total: number;
}

export default function RusnSummaryTable({
  cells,
  materials,
  groupSlug,
  selectedGroupName,
  selectedCalculationName
}: Props) {
  const { calculations, calculateCellTotal } = useRusnCalculation(groupSlug);

  const getSummaryItems = (): SummaryItem[] => {
    const items: SummaryItem[] = [];

    // Добавляем стоимость ячейки
    if (selectedGroupName && selectedCalculationName) {
      const cellCalculation = calculations.cell.find(c => c.name === selectedCalculationName);
      if (cellCalculation) {
        items.push({
          name: `${selectedGroupName} ${selectedCalculationName}`,
          price: calculateCellTotal(cellCalculation.id),
          count: cells.length,
          total: calculateCellTotal(cellCalculation.id) * cells.length
        });
      }
    }

    // Собираем все материалы
    cells.forEach(cell => {
      // Выключатель
      if (cell.breaker) {
        const breaker = materials.breaker.find(m => m.id.toString() === cell.breaker);
        if (breaker) {
          items.push({
            name: `Выключатель: ${breaker.name}`,
            price: Number(breaker.price),
            count: cell.count || 1,
            total: Number(breaker.price) * (cell.count || 1)
          });
        }
      }

      // РЗА
      if (cell.rza) {
        const rza = materials.rza.find(m => m.id.toString() === cell.rza);
        if (rza) {
          items.push({
            name: `РЗА: ${rza.name}`,
            price: Number(rza.price),
            count: cell.count || 1,
            total: Number(rza.price) * (cell.count || 1)
          });
        }
      }

      // Счетчик
      if (cell.meterType) {
        const meter = materials.meter.find(m => m.id.toString() === cell.meterType);
        if (meter) {
          items.push({
            name: `Счетчик: ${meter.name}`,
            price: Number(meter.price),
            count: cell.count || 1,
            total: Number(meter.price) * (cell.count || 1)
          });
        }
      }
    });

    return items;
  };

  const summaryItems = getSummaryItems();
  const total = summaryItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Детализация</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Наименование
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Кол-во
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summaryItems.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {item.price.toLocaleString('ru-RU')} ₸
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {item.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {item.total.toLocaleString('ru-RU')} ₸
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                Итого:
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                {total.toLocaleString('ru-RU')} ₸
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 