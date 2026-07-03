'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Power, Settings2, Gauge, Zap, Shield, Activity, ToggleLeft } from 'lucide-react';
import { useRunnSettingsEditor } from '@/hooks/settings/useRunnSettingsEditor';
import { RunnSettingsSection } from '@/components/settings/RunnSettingsSection';
import { ZeroBusbarSection } from '@/components/runn/ZeroBusbarSection';
import { SettingsDebugJournal } from '@/components/settings/SettingsDebugJournal';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';
import PageLoader from '@/shared/loader/PageLoader';

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
  } = useRunnSettingsEditor();

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)]">
        <PageLoader inline />
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
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath="/dashboard/bktp/settings/runn"
    >
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
          <SettingsDebugJournal scope="runn" />

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

          <RunnSettingsSection
            title="РПС левый"
            type="rpsLeft"
            icon={
              <div className="p-2 bg-purple-50 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            }
            allCategories={allCategories.rpsLeft || []}
            selectedCategories={selectedCategories?.rpsLeft || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <RunnSettingsSection
            title="Предохранители ПН"
            type="fusesPn"
            icon={
              <div className="p-2 bg-orange-50 rounded-lg">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            }
            allCategories={allCategories.fusesPn || []}
            selectedCategories={selectedCategories?.fusesPn || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <RunnSettingsSection
            title="Трансформатор тока НН"
            type="currentTransformer"
            icon={
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
            }
            allCategories={allCategories.currentTransformer || []}
            selectedCategories={selectedCategories?.currentTransformer || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          <RunnSettingsSection
            title="Рубильник для литого корпуса"
            type="moldedCaseSwitch"
            icon={
              <div className="p-2 bg-teal-50 rounded-lg">
                <ToggleLeft className="w-6 h-6 text-teal-600" />
              </div>
            }
            allCategories={allCategories.moldedCaseSwitch || []}
            selectedCategories={selectedCategories?.moldedCaseSwitch || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onToggleVisibility={handleToggleVisibility}
          />

          {/* Сборные шины N */}
         
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}
