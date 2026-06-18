'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, HardHat, RefreshCw } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';
import { defaultWorkPrices, useWorkPricesStore } from '@/store/useWorkPricesStore';
import { showToast } from '@/shared/modals/ToastProvider';
import { workPricesApi } from '@/api/workPrices';
import { SECTIONS } from './sections.config';
import EditableSection from './components/EditableSection';
import PageLoader from '@/shared/loader/PageLoader';

export default function WorksSettingsPage() {
  const router = useRouter();
  const setAll = useWorkPricesStore((state) => state.setAll);
  const [allOpen, setAllOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await workPricesApi.getSettings();
        setAll(settings);
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Не удалось загрузить цены работ', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setAll]);

  const handleResetAll = async () => {
    try {
      setResetting(true);
      const settings = await workPricesApi.updateSettings(defaultWorkPrices);
      setAll(settings);
      showToast('Все цены сброшены к значениям по умолчанию', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Ошибка сброса настроек', 'error');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <RoleGuard
        allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
        redirectTo="/dashboard"
        pagePath="/dashboard/settings/works"
      >
        <div className="h-[calc(100vh-64px)]">
          <PageLoader inline />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath="/dashboard/settings/works"
    >
      <div className="h-[calc(100vh-64px)] bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-4">

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-white hover:bg-[#8eba1e] border border-gray-200 rounded-xl transition-all duration-200 shadow-sm group flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-white" />
            </button>
            <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm flex-shrink-0">
              <HardHat className="w-4 h-4 text-[#8eba1e]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">Настройки работ</h1>
              <p className="text-sm text-gray-500">Цены и параметры монтажных работ</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleResetAll}
                disabled={loading || resetting}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                Сброс
              </button>
              <button
                onClick={() => setAllOpen((v) => !v)}
                className="text-xs text-gray-500 hover:text-[#8eba1e] px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm transition-colors whitespace-nowrap"
              >
                {allOpen ? 'Свернуть' : 'Раскрыть'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 items-start">
            {SECTIONS.map((section) =>
              section.id === 'runn' || section.id === 'dgu' ? (
                <div key={section.id} className="lg:col-span-2">
                  <EditableSection section={section} forceOpen={allOpen} />
                </div>
              ) : (
                <EditableSection key={section.id} section={section} forceOpen={allOpen} />
              ),
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
