import { PencilIcon } from '@heroicons/react/24/outline';

interface CalculationHeaderProps {
  name: string;
  onEdit: () => void;
}

export function CalculationHeader({ name, onEdit }: CalculationHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-[#8eba1e] font-semibold">Калькуляция</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-4 py-2 bg-[#8eba1e] text-white rounded-lg hover:bg-[#7aa31a] transition-colors shadow-sm"
      >
        <PencilIcon className="w-5 h-5" />
        Редактировать
      </button>
    </div>
  );
} 