'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Power, Settings2, Gauge } from 'lucide-react';
import { useRunnSettings } from '@/hooks/useRunnSettings';
import { RunnSettingsSection } from '@/components/settings/RunnSettingsSection';

export default function RunnSettingsPage() {
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
  } = useRunnSettings();

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
              <h1 className="text-2xl font-bold text-gray-900">Настройки БКТП РУНН</h1>
              <p className="text-sm text-gray-500 mt-1">
                Управление настройками БКТП РУНН
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
          <RunnSettingsSection
            title="Автомат выкатной"
            type="avtomatVyk"
            icon={
              <div className="p-2 bg-red-50 rounded-lg">
                <Power className="w-6 h-6 text-red-600" />
              </div>
            }
            allCategories={allCategories.avtomatVyk || []}
            selectedCategories={selectedCategories?.avtomatVyk || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <RunnSettingsSection
            title="Автомат литой корпус"
            type="avtomatLity"
            icon={
              <div className="p-2 bg-blue-50 rounded-lg">
                <Settings2 className="w-6 h-6 text-blue-600" />
              </div>
            }
            allCategories={allCategories.avtomatLity || []}
            selectedCategories={selectedCategories?.avtomatLity || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <RunnSettingsSection
            title="Счетчик"
            type="counter"
            icon={
              <div className="p-2 bg-green-50 rounded-lg">
                <Gauge className="w-6 h-6 text-green-600" />
              </div>
            }
            allCategories={allCategories.counter || []}
            selectedCategories={selectedCategories?.counter || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      </div>
    </div>
  );
}
