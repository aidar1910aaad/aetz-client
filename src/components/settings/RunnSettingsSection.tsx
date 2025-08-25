import { Plus, X, Eye, EyeOff } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  visible: boolean;
}

interface CategoryObject {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface RunnSettingsSectionProps {
  title: string;
  type: 'avtomatVyk' | 'avtomatLity' | 'counter' | 'rpsLeft';
  icon: React.ReactNode;
  allCategories: CategoryObject[] | string[];
  selectedCategories: Category[];
  onAddCategory: (type: string, categoryId: number | string) => void;
  onRemoveCategory: (type: string, categoryId: string) => void;
  onToggleVisibility: (type: string, categoryId: string) => void;
}

export function RunnSettingsSection({
  title,
  type,
  icon,
  allCategories,
  selectedCategories,
  onAddCategory,
  onRemoveCategory,
  onToggleVisibility,
}: RunnSettingsSectionProps) {
  // Convert category objects to strings if needed and store original objects
  const categoryData =
    allCategories?.map((category) => {
      if (typeof category === 'string') {
        return { name: category, id: category, original: category };
      } else {
        return { name: category.name, id: category.id, original: category };
      }
    }) || [];

  const availableCategories = categoryData.filter(
    (category) => !selectedCategories.some((selected) => selected.name === category.name)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Selected Categories */}
      <div className="space-y-3 mb-6">
        {selectedCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-gray-700">{category.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleVisibility(type, category.id)}
                className={`p-1.5 rounded-lg transition-colors duration-200 ${
                  category.visible
                    ? 'hover:bg-gray-200 text-gray-600'
                    : 'hover:bg-gray-200 text-gray-400'
                }`}
                title={category.visible ? 'Скрыть' : 'Показать'}
              >
                {category.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onRemoveCategory(type, category.id)}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Удалить"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Dropdown */}
      {availableCategories.length > 0 && (
        <div className="relative">
          <select
            onChange={(e) => {
              const categoryId = e.target.value;
              if (categoryId) {
                onAddCategory(type, categoryId);
                e.target.value = '';
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3A55DF] focus:border-transparent"
            defaultValue=""
          >
            <option value="" disabled>
              Выберите
            </option>
            {availableCategories.map((category) => (
              <option
                key={category.id}
                value={typeof category.original === 'string' ? category.name : category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Plus className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}
