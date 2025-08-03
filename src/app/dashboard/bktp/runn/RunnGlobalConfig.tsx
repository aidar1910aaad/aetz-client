'use client';

import { useRunnStore } from '@/store/useRunnStore';
import { useRunnSettings } from '@/hooks/useRunnSettings';
import { getMaterialsByCategoryId, Material } from '@/api/material';
import { useAutoMaterialSelection } from '@/hooks/useAutoMaterialSelection';
import { useState, useEffect } from 'react';
import RunnCellTable from './RunnCellTable';
import TogglerWithInput from './TogglerWithInput';

export default function RunnGlobalConfig() {
  const { global, setGlobal } = useRunnStore();
  const { selectedCategories, loading } = useRunnSettings();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [meterMaterials, setMeterMaterials] = useState<Material[]>([]);
  const [meterMaterialsLoading, setMeterMaterialsLoading] = useState(false);

  // Получаем категории из настроек РУНН
  const withdrawableOptions = selectedCategories?.avtomatVyk?.map((cat) => cat.name) || [];
  const moldedOptions = selectedCategories?.avtomatLity?.map((cat) => cat.name) || [];
  const meterOptions = selectedCategories?.counter?.map((cat) => cat.name) || [];

  // Используем хук для автоматического выбора материала
  const {
    autoSelectedMaterial,
    autoSelectedSvMaterial,
    transformerPower,
    recommendedCurrent,
    recommendedSvCurrent,
  } = useAutoMaterialSelection({
    categoryMaterials: materials,
    categoryName: global.withdrawableBreaker || '',
  });

  // Функция для получения материалов по выбранной категории
  const fetchMaterialsByCategory = async (categoryName: string) => {
    if (!categoryName || !selectedCategories) {
      setMaterials([]);
      return;
    }

    setMaterialsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен не найден');
        return;
      }

      // Находим категорию по имени и получаем её id
      const category = selectedCategories.avtomatVyk?.find((cat) => cat.name === categoryName);
      if (!category) {
        console.log('Категория не найдена в настройках РУНН:', categoryName);
        setMaterials([]);
        return;
      }

      console.log('Получаем материалы для категории:', categoryName, 'с ID:', category.id);
      const materialsData = await getMaterialsByCategoryId(parseInt(category.id), token);
      console.log('Полученные материалы:', materialsData);
      setMaterials(materialsData);
    } catch (error) {
      console.error('Ошибка получения материалов:', error);
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // Функция для получения материалов счетчика по выбранной категории
  const fetchMeterMaterialsByCategory = async (categoryName: string) => {
    if (!categoryName || !selectedCategories) {
      setMeterMaterials([]);
      return;
    }

    setMeterMaterialsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен не найден');
        return;
      }

      // Находим категорию счетчика по имени и получаем её id
      const category = selectedCategories.counter?.find((cat) => cat.name === categoryName);
      if (!category) {
        console.log('Категория счетчика не найдена в настройках РУНН:', categoryName);
        setMeterMaterials([]);
        return;
      }

      console.log('Получаем материалы счетчика для категории:', categoryName, 'с ID:', category.id);
      const materialsData = await getMaterialsByCategoryId(parseInt(category.id), token);
      console.log('Полученные материалы счетчика:', materialsData);
      setMeterMaterials(materialsData);
    } catch (error) {
      console.error('Ошибка получения материалов счетчика:', error);
      setMeterMaterials([]);
    } finally {
      setMeterMaterialsLoading(false);
    }
  };

  // При изменении выбранной категории автомата выкатного
  useEffect(() => {
    if (global.withdrawableBreaker && selectedCategories) {
      // Проверяем, существует ли выбранная категория в настройках РУНН
      const categoryExists = selectedCategories.avtomatVyk?.some(
        (cat) => cat.name === global.withdrawableBreaker
      );

      if (!categoryExists) {
        console.log(
          'Категория не найдена в настройках РУНН, очищаем выбор:',
          global.withdrawableBreaker
        );
        setGlobal('withdrawableBreaker', '');
        setMaterials([]);
        return;
      }

      fetchMaterialsByCategory(global.withdrawableBreaker);
    } else {
      setMaterials([]);
    }
  }, [global.withdrawableBreaker, selectedCategories]);

  // При изменении выбранной категории счетчика
  useEffect(() => {
    if (global.meterType && selectedCategories) {
      // Проверяем, существует ли выбранная категория в настройках РУНН
      const categoryExists = selectedCategories.counter?.some(
        (cat) => cat.name === global.meterType
      );

      if (!categoryExists) {
        console.log(
          'Категория счетчика не найдена в настройках РУНН, очищаем выбор:',
          global.meterType
        );
        setGlobal('meterType', '');
        setMeterMaterials([]);
        return;
      }

      fetchMeterMaterialsByCategory(global.meterType);
    } else {
      setMeterMaterials([]);
    }
  }, [global.meterType, selectedCategories]);

  // Проверка и очистка несуществующих категорий при загрузке настроек
  useEffect(() => {
    if (selectedCategories) {
      let hasChanges = false;

      // Проверяем автомат выкатной
      if (global.withdrawableBreaker) {
        const categoryExists = selectedCategories.avtomatVyk?.some(
          (cat) => cat.name === global.withdrawableBreaker
        );
        if (!categoryExists) {
          console.log(
            'Очищаем несуществующую категорию автомата выкатного:',
            global.withdrawableBreaker
          );
          setGlobal('withdrawableBreaker', '');
          hasChanges = true;
        }
      }

      // Проверяем автомат литой корпус
      if (global.moldedCaseBreaker) {
        const categoryExists = selectedCategories.avtomatLity?.some(
          (cat) => cat.name === global.moldedCaseBreaker
        );
        if (!categoryExists) {
          console.log(
            'Очищаем несуществующую категорию автомата литого корпуса:',
            global.moldedCaseBreaker
          );
          setGlobal('moldedCaseBreaker', '');
          hasChanges = true;
        }
      }

      // Проверяем счетчик
      if (global.meterType) {
        const categoryExists = selectedCategories.counter?.some(
          (cat) => cat.name === global.meterType
        );
        if (!categoryExists) {
          console.log('Очищаем несуществующую категорию счетчика:', global.meterType);
          setGlobal('meterType', '');
          hasChanges = true;
        }
      }

      if (hasChanges) {
        console.log('Очищены несуществующие категории из глобального состояния');
      }
    }
  }, [selectedCategories]);

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

        {/* Отображение материалов по выбранной категории */}
        {global.withdrawableBreaker && (
          <div className="mt-4 p-4 bg-gray-50 rounded border">
            <h4 className="font-medium mb-2">
              Материалы категории &quot;{global.withdrawableBreaker}&quot;:
            </h4>
            {materialsLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3A55DF]"></div>
            ) : materials.length > 0 ? (
              <div className="bg-white p-3 rounded border">
                <pre className="text-xs overflow-auto max-h-60">
                  {JSON.stringify(materials, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Материалы не найдены</p>
            )}
          </div>
        )}

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
          disabled={meterMaterialsLoading}
        >
          <option value="">Выберите</option>
          {meterOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {meterMaterialsLoading && (
          <p className="text-sm text-gray-500 mt-1">Загрузка материалов...</p>
        )}
      </div>

      <RunnCellTable
        categoryMaterials={materials}
        autoSelectedMaterial={autoSelectedMaterial}
        autoSelectedSvMaterial={autoSelectedSvMaterial}
        meterMaterials={meterMaterials}
        meterMaterialsLoading={meterMaterialsLoading}
      />

      <TogglerWithInput label="Шинный мост (м)">
        <input
          type="number"
          min={0}
          value={global.busBridgeLength}
          onChange={(e) => setGlobal('busBridgeLength', Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        />
      </TogglerWithInput>
    </section>
  );
}
