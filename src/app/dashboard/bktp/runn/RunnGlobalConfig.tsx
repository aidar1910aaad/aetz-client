'use client';

import { useRunnStore } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import PageLoader from '@/shared/loader/PageLoader';
import type { useRunnCategories } from '@/hooks/useRunnCategories';
import { Select } from '@/components/ui/select';

type RunnSettingsResult = ReturnType<typeof useRunnCategories>;

interface RunnGlobalConfigProps {
  materials?: Material[];
  selectedCategories?: RunnSettingsResult['selectedCategories'];
  settingsLoading?: boolean;
}

export default function RunnGlobalConfig({
  materials = [],
  selectedCategories = null,
  settingsLoading = false,
}: RunnGlobalConfigProps = {}) {
  const { global, setGlobal } = useRunnStore();
  const loading = settingsLoading;

  // Получаем категории из настроек РУНН
  const withdrawableOptions =
    selectedCategories?.avtomatVyk?.filter((cat) => cat.visible).map((cat) => cat.name) || [];
  const moldedOptions =
    selectedCategories?.avtomatLity?.filter((cat) => cat.visible).map((cat) => cat.name) || [];
  const meterOptions =
    selectedCategories?.counter?.filter((cat) => cat.visible).map((cat) => cat.name) || [];






  if (loading) {
    return (
      <section className="mb-4 flex min-h-[120px] items-center justify-center rounded-xl border border-gray-100 bg-gray-50/50">
        <PageLoader size="compact" message="Загрузка настроек РУНН..." />
      </section>
    );
  }

  if (!selectedCategories) {
    return (
      <section className="flex flex-col gap-6 mb-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Настройки РУНН не загружены</h3>
          <p className="text-yellow-700">
            Не удалось загрузить настройки РУНН. Пожалуйста, проверьте подключение к серверу и
            попробуйте обновить страницу.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex gap-4 mb-4">
      <div className="flex-1">
        <label className="block mb-1 font-medium">Автомат выкатной</label>
        <Select
          value={global.withdrawableBreaker || ''}
          onChange={(e) => setGlobal('withdrawableBreaker', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {withdrawableOptions.map((opt, index) => (
            <option key={`${opt}-${index}`} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex-1">
        <label className="block mb-1 font-medium">Автомат литой корпус</label>
        <Select
          value={global.moldedCaseBreaker || ''}
          onChange={(e) => setGlobal('moldedCaseBreaker', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {moldedOptions.map((opt, index) => (
            <option key={`${opt}-${index}`} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex-1">
        <label className="block mb-1 font-medium">Счетчик</label>
        <Select
          value={global.meterType || ''}
          onChange={(e) => setGlobal('meterType', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {meterOptions.map((opt, index) => (
            <option key={`${opt}-${index}`} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </div>
    </section>
  );
}
