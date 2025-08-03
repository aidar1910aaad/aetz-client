'use client';

import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Save,
  Power,
  Settings2,
  Gauge,
  Zap,
  Battery,
  Cable,
  Activity,
} from 'lucide-react';
import { useRusnSettingsOld } from '@/hooks/useRusnSettings';
import { SettingsSection } from '@/components/settings/SettingsSection';

export default function RusnSettingsPage() {
  const router = useRouter();
  const {
    allCategories,
    selectedCategories,
    loading,
    hasChanges,
    handleAddCategory,
    handleRemoveCategory,
    handleToggleVisibility,
    handleSave,
  } = useRusnSettingsOld();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A55DF]"></div>
      </div>
    );
  }

  if (!selectedCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</div>
          <div className="text-sm text-gray-600">Не удалось загрузить настройки</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-full transition-colors duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Настройки РУСН</h1>
              <p className="text-sm text-gray-500 mt-1">
                Управление настройками РУСН
                {hasChanges && (
                  <span className="ml-2 text-orange-600 font-medium">
                    • Есть несохраненные изменения
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              hasChanges
                ? 'bg-[#3A55DF] text-white hover:bg-[#2e46c5]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5" />
            Сохранить
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <SettingsSection
            title="Вакуумный выключатель"
            type="switch"
            icon={
              <div className="p-2 bg-red-50 rounded-lg">
                <Power className="w-6 h-6 text-red-600" />
              </div>
            }
            allCategories={allCategories}
            selectedCategories={selectedCategories?.switch || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <SettingsSection
            title="РЗА"
            type="rza"
            icon={
              <div className="p-2 bg-blue-50 rounded-lg">
                <Settings2 className="w-6 h-6 text-blue-600" />
              </div>
            }
            allCategories={allCategories}
            selectedCategories={selectedCategories?.rza || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <SettingsSection
            title="Счетчик"
            type="counter"
            icon={
              <div className="p-2 bg-green-50 rounded-lg">
                <Gauge className="w-6 h-6 text-green-600" />
              </div>
            }
            allCategories={allCategories}
            selectedCategories={selectedCategories?.counter || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <SettingsSection
            title="Разьединитель"
            type="sr"
            icon={
              <div className="p-2 bg-purple-50 rounded-lg">
                <Cable className="w-6 h-6 text-purple-600" />
              </div>
            }
            allCategories={allCategories}
            selectedCategories={selectedCategories?.sr || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <SettingsSection
            title="Силовой трансформатор"
            type="tsn"
            icon={
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
            }
            allCategories={allCategories}
            selectedCategories={selectedCategories?.tsn || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <SettingsSection
            title="Трансформатор напряжения"
            type="tn"
            icon={
              <div className="p-2 bg-orange-50 rounded-lg">
                <Battery className="w-6 h-6 text-orange-600" />
              </div>
            }
            allCategories={allCategories}
            selectedCategories={selectedCategories?.tn || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <SettingsSection
            title="Трансформатор тока"
            type="tt"
            icon={
              <div className="p-2 bg-pink-50 rounded-lg">
                <Activity className="w-6 h-6 text-pink-600" />
              </div>
            }
            allCategories={allCategories}
            selectedCategories={selectedCategories?.tt || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      </div>
    </div>
  );
}
