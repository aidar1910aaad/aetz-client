import Link from 'next/link';

interface RusnActionButtonsProps {
  skip: boolean;
  showCells: boolean;
  onToggleCells: () => void;
}

export const RusnActionButtons = ({ skip, showCells, onToggleCells }: RusnActionButtonsProps) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      {!skip && (
        <button
          onClick={onToggleCells}
          className="text-sm px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
        >
          {showCells ? 'Скрыть конфигурацию' : 'Показать конфигурацию'}
        </button>
      )}

      <Link href="/dashboard/final">
        <button className="bg-[#3A55DF] text-white px-4 py-2 rounded-[20px] hover:bg-blue-700 transition">
          Текущая заявка
        </button>
      </Link>
    </div>
  );
};
