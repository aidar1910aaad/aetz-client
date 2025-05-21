import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface CategorySelectProps {
  categories: Array<{ id: number; name: string }>;
  selectedCategories: Array<{ id: number; name: string }>;
  onAdd: (categoryId: number) => void;
  onRemove: (categoryId: number) => void;
}

export function CategorySelect({ 
  categories, 
  selectedCategories, 
  onAdd, 
  onRemove 
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableCategories = categories.filter(
    cat => !selectedCategories.some(selected => selected.id === cat.id)
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 border rounded-lg hover:border-[#3A55DF] transition-colors"
      >
        <span className="text-gray-600">Выбрать категорию</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {availableCategories.length > 0 ? (
            <div className="max-h-60 overflow-auto">
              {availableCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    onAdd(category.id);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  {category.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-2 text-gray-500">
              Нет доступных категорий
            </div>
          )}
        </div>
      )}

      {selectedCategories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <div
              key={category.id}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full"
            >
              <span className="text-sm">{category.name}</span>
              <button
                onClick={() => onRemove(category.id)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 