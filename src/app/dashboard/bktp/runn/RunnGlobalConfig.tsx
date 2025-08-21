'use client';

import { useRunnStore } from '@/store/useRunnStore';
import { useRunnSettings } from '@/hooks/useRunnSettings';
import { Material } from '@/api/material';

interface RunnGlobalConfigProps {
  materials?: Material[];
  autoSelectedMaterial?: Material | null;
  autoSelectedSvMaterial?: Material | null;
  transformerPower?: number;
  recommendedCurrent?: number;
  recommendedSvCurrent?: number;
}

export default function RunnGlobalConfig({
  materials = [],
  autoSelectedMaterial,
  autoSelectedSvMaterial,
  transformerPower,
  recommendedCurrent,
  recommendedSvCurrent,
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
    <section className="flex flex-col gap-6 mb-4">
      <div>
        <label className="block mb-1 font-medium">Автомат выкатной</label>
        <select
          value={global.withdrawableBreaker || ''}
          onChange={(e) => setGlobal('withdrawableBreaker', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {withdrawableOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>



        {/* Информация об автоматическом выборе материала */}
        {transformerPower && recommendedCurrent && (
          <div className="mt-4 p-4 bg-blue-50 rounded border">
            <h4 className="font-medium mb-2 text-blue-800">
              Автоматический выбор материала для ячейки Ввод:
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                Мощность трансформатора: <strong>{transformerPower} кВА</strong>
              </p>
              <p>
                Рекомендуемый ток для ввода: <strong>{recommendedCurrent} A</strong>
              </p>
              {autoSelectedMaterial ? (
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-green-800">
                    <strong>Автоматически выбран:</strong> {autoSelectedMaterial.name}
                  </p>
                  <p className="text-green-700 text-xs">
                    Цена: {Number(autoSelectedMaterial.price).toLocaleString()} ₸
                  </p>
                </div>
              ) : (
                <p className="text-orange-600">
                  <strong>Материал для тока {recommendedCurrent}A не найден в категории</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Информация о материале для секционного выключателя */}
        {transformerPower && recommendedSvCurrent && (
          <div className="mt-4 p-4 bg-purple-50 rounded border">
            <h4 className="font-medium mb-2 text-purple-800">
              Рекомендуемый материал для ячейки Секционный выключатель:
            </h4>
            <div className="text-sm text-purple-700 space-y-1">
              <p>
                Мощность трансформатора: <strong>{transformerPower} кВА</strong>
              </p>
              <p>
                Рекомендуемый ток для секционного выключателя:{' '}
                <strong>{recommendedSvCurrent} A</strong>
              </p>
              {autoSelectedSvMaterial ? (
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-green-800">
                    <strong>Рекомендуемый материал:</strong> {autoSelectedSvMaterial.name}
                  </p>
                  <p className="text-green-700 text-xs">
                    Цена: {Number(autoSelectedSvMaterial.price).toLocaleString()} ₸
                  </p>
                </div>
              ) : (
                <p className="text-orange-600">
                  <strong>Материал для тока {recommendedSvCurrent}A не найден в категории</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">Автомат литой корпус</label>
        <select
          value={global.moldedCaseBreaker || ''}
          onChange={(e) => setGlobal('moldedCaseBreaker', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {moldedOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Счетчик</label>
        <select
          value={global.meterType || ''}
          onChange={(e) => setGlobal('meterType', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {meterOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
