import { RusnCell } from '@/store/useRusnStore';

interface QuantityInputProps {
  cell: RusnCell;
  onUpdate: (id: string, field: keyof RusnCell, value: RusnCell[keyof RusnCell]) => void;
}

export default function QuantityInput({ cell, onUpdate }: QuantityInputProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[100px]">
      <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
      <input
        type="number"
        min={1}
        value={cell.count || 1}
        onChange={(e) => onUpdate(cell.id, 'count', Number(e.target.value))}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
      />
    </div>
  );
}
