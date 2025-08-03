import { RusnCell } from '@/store/useRusnStore';

interface CellActionButtonsProps {
  cell: RusnCell;
  onRemove: (id: string) => void;
}

export default function CellActionButtons({ cell, onRemove }: CellActionButtonsProps) {
  const handleAddOutgoing = () => {
    const newCell = {
      id: crypto.randomUUID(),
      purpose: 'Отходящая',
      cellType: cell.cellType,
      count: 1,
      totalPrice: 0,
    };
    const event = new CustomEvent('addCell', { detail: newCell });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex gap-2 ml-auto">
      {cell.purpose === 'Отходящая' && (
        <button
          onClick={handleAddOutgoing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          + Добавить отходящую
        </button>
      )}
      <button
        onClick={() => onRemove(cell.id)}
        className="text-red-600 hover:text-red-800 text-sm font-bold"
        title="Удалить ячейку"
      >
        ✕
      </button>
    </div>
  );
}
