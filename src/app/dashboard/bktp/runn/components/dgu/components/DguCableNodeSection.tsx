import type { RunnCell } from '@/store/useRunnStore';
import TogglerWithInput from '../../TogglerWithInput';

interface DguCableNodeSectionProps {
  dguCableNodeCell: RunnCell | undefined;
  onAddCell: () => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemoveCell: () => void;
}

export default function DguCableNodeSection({
  dguCableNodeCell,
  onAddCell,
  onUpdateQuantity,
  onRemoveCell,
}: DguCableNodeSectionProps) {
  return (
    <TogglerWithInput label="РУНН-ДГУ: Узел ДГУ кабель">
      {!dguCableNodeCell ? (
        <button
          onClick={onAddCell}
          className="px-4 py-2 bg-[#3A55DF] hover:bg-[#2d48be] text-white rounded text-sm font-medium"
        >
          + Добавить узел ДГУ кабель
        </button>
      ) : (
        <div className="flex gap-4 items-end p-4 rounded bg-white border border-gray-100">
          <div className="flex flex-col gap-1 min-w-[100px]">
            <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
            <input
              type="number"
              min={1}
              value={dguCableNodeCell.quantity || 1}
              onChange={(e) => onUpdateQuantity(Number(e.target.value) || 1)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            />
          </div>

          <button
            onClick={onRemoveCell}
            className="text-red-600 hover:text-red-800 text-sm font-bold ml-auto"
            title="Удалить ячейку"
          >
            ✕
          </button>
        </div>
      )}
    </TogglerWithInput>
  );
}

