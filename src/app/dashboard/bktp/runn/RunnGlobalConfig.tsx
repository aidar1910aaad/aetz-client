'use client';

import { useRunnStore } from '@/store/useRunnStore';
import { useRunnSettings } from '@/hooks/useRunnSettings';
import { Material } from '@/api/material';

interface RunnGlobalConfigProps {
  materials?: Material[];
}

export default function RunnGlobalConfig({
  materials = [],
}: RunnGlobalConfigProps = {}) {
  
  const { global, setGlobal } = useRunnStore();
  const { selectedCategories, loading } = useRunnSettings();

  // Получаем категории из настроек РУНН
  const withdrawableOptions = selectedCategories?.avtomatVyk?.map((cat) => cat.name) || [];
  const moldedOptions = selectedCategories?.avtomatLity?.map((cat) => cat.name) || [];
  const meterOptions = selectedCategories?.counter?.map((cat) => cat.name) || [];






  if (loading) {
    return (
      <section className="flex flex-col gap-6 mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A55DF] mx-auto"></div>
        <p className="text-center text-gray-500">Загрузка настроек РУНН...</p>
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
        <select
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
        </select>
      </div>

      <div className="flex-1">
        <label className="block mb-1 font-medium">Автомат литой корпус</label>
        <select
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
        </select>
      </div>

      <div className="flex-1">
        <label className="block mb-1 font-medium">Счетчик</label>
        <select
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
        </select>
      </div>
    </section>
  );
}
