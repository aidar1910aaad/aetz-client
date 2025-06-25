import { Switchgear } from '@/api/switchgear';
import { Pencil, Trash2 } from 'lucide-react';

interface SwitchgearTableProps {
  configurations: Switchgear[];
  onEdit: (config: Switchgear) => void;
  onDelete: (id: number) => void;
  onSelect: (config: Switchgear) => void;
}

export function SwitchgearTable({
  configurations,
  onEdit,
  onDelete,
  onSelect,
}: SwitchgearTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Тип
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Выключатель
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ток
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Группа
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Шина
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ячейки
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {configurations.map((config) => (
            <tr
              key={config.id}
              onClick={() => onSelect(config)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{config.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {config.breaker}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {config.amperage} А
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{config.group}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{config.busbar}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {config.cells.map((cell) => (
                  <div key={cell.name}>
                    {cell.name}: {cell.quantity}
                  </div>
                ))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(config)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(config.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
