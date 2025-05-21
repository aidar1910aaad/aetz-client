import { Power, Settings2, Gauge } from 'lucide-react';
import { CategoryToggle } from './CategoryToggle';
import { CategorySelect } from './CategorySelect';

interface SettingsSectionProps {
  title: string;
  type: 'switch' | 'rza' | 'counter';
  icon: React.ReactNode;
  allCategories: Array<{ id: number; name: string }>;
  selectedCategories: Array<{
    id: number;
    name: string;
    isVisible: boolean;
  }>;
  onAddCategory: (type: 'switch' | 'rza' | 'counter', categoryId: number) => void;
  onRemoveCategory: (type: 'switch' | 'rza' | 'counter', categoryId: number) => void;
  onToggleVisibility: (type: 'switch' | 'rza' | 'counter', categoryId: number) => void;
}

export function SettingsSection({
  title,
  type,
  icon,
  allCategories,
  selectedCategories,
  onAddCategory,
  onRemoveCategory,
  onToggleVisibility
}: SettingsSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      <CategorySelect
        categories={allCategories}
        selectedCategories={selectedCategories}
        onAdd={(categoryId) => onAddCategory(type, categoryId)}
        onRemove={(categoryId) => onRemoveCategory(type, categoryId)}
      />

      <div className="mt-4 space-y-3">
        {selectedCategories.map(category => (
          <CategoryToggle
            key={category.id}
            name={category.name}
            isVisible={category.isVisible}
            onToggle={() => onToggleVisibility(type, category.id)}
          />
        ))}
      </div>
    </div>
  );
} 