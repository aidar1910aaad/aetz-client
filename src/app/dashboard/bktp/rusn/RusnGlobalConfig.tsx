'use client';

import { useRusnStore } from '@/store/useRusnStore';
import TogglerWithInput from './TogglerWithInput';
import RusnCellTable from './RusnCellTable';
import { useEffect, useState } from 'react';
import { getSettings } from '@/api/settings';
import { getAllCategories } from '@/api/categories';

export default function RusnGlobalConfig({ availableCells }: { availableCells: string[] }) {
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
          
          // Получаем все видимые категории для каждого типа
          const visibleRusn = settings.settings.rusn?.filter(item => item.isVisible) || [];
          const visibleRunn = settings.settings.runn?.filter(item => item.isVisible) || [];
          const visibleBmz = settings.settings.bmz?.filter(item => item.isVisible) || [];

          console.log('Visible categories:', {
            rusn: visibleRusn,
            runn: visibleRunn,
            bmz: visibleBmz
          });

          // Обновляем состояние с ID категорий
          setRusnSettings({
            switch: visibleRusn.map(item => ({
              id: item.categoryId,
              name: allCategories.find(cat => cat.id === item.categoryId)?.name || `Категория ${item.categoryId}`
            })),
            rza: visibleRunn.map(item => ({
              id: item.categoryId,
              name: allCategories.find(cat => cat.id === item.categoryId)?.name || `Категория ${item.categoryId}`
            })),
            counter: visibleBmz.map(item => ({
              id: item.categoryId,
              name: allCategories.find(cat => cat.id === item.categoryId)?.name || `Категория ${item.categoryId}`
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
  }, [allCategories, setGlobal]);

  return (
    <section className="flex flex-col gap-6">
      {/* Выключатель */}
      <div>
        <label className="block mb-1 font-medium">Выключатель (по умолчанию)</label>
        <select
          value={global.breaker}
          onChange={(e) => setGlobal('breaker', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {rusnSettings.switch.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      {/* РЗА */}
      <div>
        <label className="block mb-1 font-medium">РЗА (по умолчанию)</label>
        <select
          value={global.rza}
          onChange={(e) => setGlobal('rza', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {rusnSettings.rza.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Счетчик */}
      <div>
        <label className="block mb-1 font-medium">Счётчик (по умолчанию)</label>
        <select
          value={global.meterType}
          onChange={(e) => setGlobal('meterType', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {rusnSettings.counter.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <RusnCellTable />

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
