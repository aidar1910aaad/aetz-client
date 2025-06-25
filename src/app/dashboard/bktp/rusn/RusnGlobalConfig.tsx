'use client';

import { useRusnStore } from '@/store/useRusnStore';
import SelectWithLabel from './SelectWithLabel';
import { useEffect, useState } from 'react';
import { getSettings } from '@/api/settings';
import { getAllCategories } from '@/api/categories';
import { useCalculationGroups } from '@/hooks/useCalculationGroups';

export default function RusnGlobalConfig() {
  const { global, setGlobal } = useRusnStore();
  const [rusnSettings, setRusnSettings] = useState<{
    switch: { id: number; name: string }[];
    rza: { id: number; name: string }[];
    counter: { id: number; name: string }[];
  }>({
    switch: [],
    rza: [],
    counter: [],
  });
  const [allCategories, setAllCategories] = useState<{ id: number; name: string }[]>([]);
  const { groups, loading: groupsLoading, error: groupsError } = useCalculationGroups();

  // Загружаем категории
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const categories = await getAllCategories(token);
        setAllCategories(categories);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };

    fetchCategories();
  }, []);

  // Загружаем настройки РУСН
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const settings = await getSettings(token);

        if (settings) {
          console.log('Settings loaded:', settings);

          // Получаем все видимые категории для каждого типа из секции rusn
          const visibleRusn = settings.settings.rusn?.filter((item) => item.isVisible) || [];

          console.log('Visible RUSN categories:', visibleRusn);

          // Обновляем состояние с ID категорий
          setRusnSettings({
            switch: visibleRusn
              .filter((item) => item.type === 'switch')
              .map((item) => ({
                id: item.categoryId,
                name:
                  allCategories.find((cat) => cat.id === item.categoryId)?.name ||
                  `Категория ${item.categoryId}`,
              })),
            rza: visibleRusn
              .filter((item) => item.type === 'rza')
              .map((item) => ({
                id: item.categoryId,
                name:
                  allCategories.find((cat) => cat.id === item.categoryId)?.name ||
                  `Категория ${item.categoryId}`,
              })),
            counter: visibleRusn
              .filter((item) => item.type === 'counter')
              .map((item) => ({
                id: item.categoryId,
                name:
                  allCategories.find((cat) => cat.id === item.categoryId)?.name ||
                  `Категория ${item.categoryId}`,
              })),
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
      }
    };

    if (allCategories.length > 0) {
      fetchSettings();
    }
  }, [allCategories]);

  const handleGroupChange = (groupSlug: string) => {
    const group = groups.find((g) => g.slug === groupSlug);
    if (group) {
      setGlobal('bodyType', group.name);
      // Сохраняем slug для использования в других компонентах
      localStorage.setItem('selectedGroupSlug', groupSlug);
      localStorage.setItem('selectedGroupName', group.name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Тип ячеек */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Тип ячеек</h3>
        {groupsLoading ? (
          <div className="text-sm text-gray-600">Загрузка типов ячеек...</div>
        ) : groupsError ? (
          <div className="text-sm text-red-600">Ошибка загрузки: {groupsError}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleGroupChange(group.slug)}
                className={`px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                  global.bodyType === group.name
                    ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        )}
        {global.bodyType && (
          <p className="text-xs text-gray-600 mt-2">
            Выбран тип: <span className="font-medium">{global.bodyType}</span>
          </p>
        )}
      </div>

      {/* Оборудование */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Оборудование</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectWithLabel
            label="Выключатель"
            value={global.breaker || ''}
            onChange={(value) => setGlobal('breaker', value)}
            options={rusnSettings.switch.map((cat) => ({
              value: cat.id.toString(),
              label: cat.name,
            }))}
          />
          <SelectWithLabel
            label="РЗА"
            value={global.rza || ''}
            onChange={(value) => setGlobal('rza', value)}
            options={rusnSettings.rza.map((cat) => ({
              value: cat.id.toString(),
              label: cat.name,
            }))}
          />
          <SelectWithLabel
            label="Счетчик"
            value={global.meterType || ''}
            onChange={(value) => setGlobal('meterType', value)}
            options={rusnSettings.counter.map((cat) => ({
              value: cat.id.toString(),
              label: cat.name,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
