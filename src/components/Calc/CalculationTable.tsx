import { Trash2 } from 'lucide-react';
import { CalcItem } from '@/app/dashboard/calc/new/page';

type Props = {
  items: CalcItem[];
  onRemoveItem: (index: number) => void;
};

export default function CalculationTable({ items, onRemoveItem }: Props) {
  if (items.length === 0) return <p className="text-sm text-gray-500">Пока нет позиций</p>;

  return (
    <table className="w-full text-sm border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Наименование</th>
          <th className="p-2 border">Ед.</th>
          <th className="p-2 border">Цена</th>
          <th className="p-2 border">Кол-во</th>
          <th className="p-2 border">Сумма</th>
          <th className="p-2 border"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <td className="p-2 border">{item.name}</td>
            <td className="p-2 border">{item.unit}</td>
            <td className="p-2 border">{item.price}</td>
            <td className="p-2 border">{item.quantity}</td>
            <td className="p-2 border">{(item.price * item.quantity).toLocaleString()}</td>
            <td className="p-2 border text-right">
              <button onClick={() => onRemoveItem(index)} className="text-red-500 hover:underline">
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
