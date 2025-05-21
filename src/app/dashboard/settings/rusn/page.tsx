'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Power, Settings2, Gauge } from 'lucide-react';
import { useRusnSettings } from '@/hooks/useRusnSettings';
import { SettingsSection } from '@/components/settings/SettingsSection';

export default function RusnSettingsPage() {
  const router = useRouter();
  const { 
    allCategories,
    selectedCategories,
    loading,
    handleAddCategory,
    handleRemoveCategory,
    handleToggleVisibility,
    handleSave
  } = useRusnSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A55DF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <p className="text-sm text-gray-500 mt-1">Управление настройками РУСН</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3A55DF] text-white hover:bg-[#2e46c5] transition-all duration-200"
          >
            <Save className="w-5 h-5" />
            Сохранить
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SettingsSection
            title="Выключатель"
            type="switch"
            icon={<div className="p-2 bg-red-50 rounded-lg"><Power className="w-6 h-6 text-red-600" /></div>}
            allCategories={allCategories}
            selectedCategories={selectedCategories.switch}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <SettingsSection
            title="РЗА"
            type="rza"
            icon={<div className="p-2 bg-blue-50 rounded-lg"><Settings2 className="w-6 h-6 text-blue-600" /></div>}
            allCategories={allCategories}
            selectedCategories={selectedCategories.rza}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <SettingsSection
            title="Счетчик"
            type="counter"
            icon={<div className="p-2 bg-green-50 rounded-lg"><Gauge className="w-6 h-6 text-green-600" /></div>}
            allCategories={allCategories}
            selectedCategories={selectedCategories.counter}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      </div>
    </div>
  );
} 