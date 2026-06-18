import { X, Eye, EyeOff } from 'lucide-react';
import { CategorySearchSelect } from './CategorySearchSelect';
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

interface SettingsSectionProps {
  title: string;
  type: 'switch' | 'rza' | 'counter' | 'sr' | 'tsn' | 'tn' | 'tt';
  icon: React.ReactNode;
  allCategories: CategoryObject[] | string[];
  selectedCategories: Category[];
  onAddCategory: (type: string, categoryId: number | string) => void;
  onRemoveCategory: (type: string, categoryId: string) => void;
  onToggleVisibility: (type: string, categoryId: string) => void;
}

export function SettingsSection({
  title,
  type,
  icon,
  allCategories,
  selectedCategories,
  onAddCategory,
  onRemoveCategory,
  onToggleVisibility,
}: SettingsSectionProps) {
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

      {/* Add Category Search */}
      {availableCategories.length > 0 && (
        <CategorySearchSelect
          options={availableCategories.map((category) => ({
            id: category.id,
            name: category.name,
            value: typeof category.original === 'string' ? category.name : category.id,
          }))}
          onSelect={(categoryId) => onAddCategory(type, categoryId)}
        />
      )}    </div>
  );
}
