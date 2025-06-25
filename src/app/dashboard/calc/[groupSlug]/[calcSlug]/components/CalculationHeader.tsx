import { PencilIcon } from '@heroicons/react/24/outline';

interface CalculationHeaderProps {
  name: string;
  onEdit: () => void;
}

export function CalculationHeader({ name, onEdit }: CalculationHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">{name}</h1>
      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        <PencilIcon className="w-5 h-5" />
        Редактировать
      </button>
    </div>
  );
} 