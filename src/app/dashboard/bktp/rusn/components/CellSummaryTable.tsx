import { RusnCell } from '@/store/useRusnStore';
import { RusnMaterials, formatCellDescription } from '@/utils/rusnMaterials';

interface CellSummaryTableProps {
  cell: RusnCell;
  materials: RusnMaterials;
  selectedGroupName: string;
  currentCalculation: string;
  total: number;
  cellType?: string;
}

export default function CellSummaryTable({
  cell,
  materials,
  selectedGroupName,
  currentCalculation,
  total,
  cellType,
}: CellSummaryTableProps) {
  const description = formatCellDescription(cell, materials);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 text-sm text-gray-900">{description}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
              {cell.count || 1} шт.
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
              <div className="flex flex-col items-end">
                <span>{(total / (cell.count || 1)).toLocaleString('ru-RU')} ₸</span>
                <span className="text-xs text-gray-500">
                  Итого: {total.toLocaleString('ru-RU')} ₸
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
