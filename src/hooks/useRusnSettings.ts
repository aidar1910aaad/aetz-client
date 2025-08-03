import { useState, useEffect } from 'react';
import { Category } from '@/api/categories';
import { getAllCategories } from '@/api/categories';
import { getSettings, saveSettings } from '@/api/settings/index';
import { api } from '@/api/baseUrl';
import { showToast } from '@/shared/modals/ToastProvider';
import { RusnSettings, fetchCategories, fetchRusnSettings } from '@/utils/rusnSettings';

interface CategorySettings {
  id: number;
  name: string;
  isVisible: boolean;
}

export const useRusnSettings = () => {
  const [rusnSettings, setRusnSettings] = useState<RusnSettings>({
    switch: [],
    rza: [],
    counter: [],
    sr: [],
    tsn: [],
    tn: [],
    tt: [],
  });
  const [allCategories, setAllCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token') || '';
        if (!token) {
          throw new Error('Токен не найден');
        }

        // Загружаем категории
        const categories = await fetchCategories(token);
        setAllCategories(categories);

        // Загружаем настройки РУСН
        if (categories.length > 0) {
          const settings = await fetchRusnSettings(token, categories);
          if (settings) {
            setRusnSettings(settings);
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке настроек РУСН:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    rusnSettings,
    allCategories,
    loading,
    error,
  };
};

export function useRusnSettingsOld() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<{
    switch: CategorySettings[];
    rza: CategorySettings[];
    counter: CategorySettings[];
    sr: CategorySettings[];
    tsn: CategorySettings[];
    tn: CategorySettings[];
    tt: CategorySettings[];
  }>({
    switch: [],
    rza: [],
    counter: [],
    sr: [],
    tsn: [],
    tn: [],
    tt: [],
  });
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const [categories, settings] = await Promise.all([
        getAllCategories(token),
        getSettings(token),
      ]);

      console.log('=== useRusnSettings: Получение данных ===');
      console.log('Fetched categories:', categories);
      console.log('Fetched settings:', settings);
      console.log('Тип настроек:', typeof settings);
      console.log('Структура настроек:', settings ? Object.keys(settings) : 'null');

      setAllCategories(categories);

      if (settings) {
        const rusnSettings = settings.settings.rusn || [];
        console.log('RUSN settings:', rusnSettings);
        console.log('Количество настроек РУСН:', rusnSettings.length);
        console.log('Тип настроек РУСН:', typeof rusnSettings);

        // Показываем детальную информацию о каждой настройке
        rusnSettings.forEach((setting, index) => {
          console.log(`Настройка ${index + 1}:`, {
            type: setting.type,
            categoryId: setting.categoryId,
            isVisible: setting.isVisible,
            categoryName:
              categories.find((cat) => cat.id === setting.categoryId)?.name || 'Не найдена',
          });
        });

        const categorizedSettings = {
          switch: [],
          rza: [],
          counter: [],
          sr: [],
          tsn: [],
          tn: [],
          tt: [],
        };

        rusnSettings.forEach((setting) => {
          const category = categories.find((cat) => cat.id === setting.categoryId);
          if (category) {
            const categorySetting = {
              id: category.id,
              name: category.name,
              isVisible: setting.isVisible,
            };

            switch (setting.type) {
              case 'switch':
                categorizedSettings.switch.push(categorySetting);
                break;
              case 'rza':
                categorizedSettings.rza.push(categorySetting);
                break;
              case 'counter':
                categorizedSettings.counter.push(categorySetting);
                break;
              case 'sr':
                categorizedSettings.sr.push(categorySetting);
                break;
              case 'tsn':
                categorizedSettings.tsn.push(categorySetting);
                break;
              case 'tn':
                categorizedSettings.tn.push(categorySetting);
                break;
              case 'tt':
                categorizedSettings.tt.push(categorySetting);
                break;
            }
          }
        });

        setSelectedCategories(categorizedSettings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Ошибка при загрузке данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = (type: string, categoryId: number | string) => {
    let category;

    // Проверяем, является ли categoryId числом или строкой
    if (typeof categoryId === 'number' || !isNaN(Number(categoryId))) {
      // Это ID из API
      category = allCategories.find((cat) => cat.id === Number(categoryId));
    } else {
      // Это строка из моковых данных - ищем по названию
      category = allCategories.find((cat) => cat.name === categoryId);
    }

    if (!category) {
      console.error('Категория не найдена:', categoryId);
      return;
    }

    const isAlreadyAdded = Object.values(selectedCategories).some((categories) =>
      categories.some((cat) => cat.id === category.id)
    );

    if (isAlreadyAdded) {
      showToast('Эта категория уже добавлена в другой раздел', 'error');
      return;
    }

    setSelectedCategories((prev) => ({
      ...prev,
      [type]: [
        ...prev[type as keyof typeof prev],
        { id: category.id, name: category.name, isVisible: true },
      ],
    }));
    setHasChanges(true);
  };

  const handleRemoveCategory = (type: string, categoryId: number | string) => {
    const idToRemove = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
    setSelectedCategories((prev) => ({
      ...prev,
      [type]: prev[type as keyof typeof prev].filter((cat) => cat.id !== idToRemove),
    }));
    setHasChanges(true);
  };

  const handleToggleVisibility = (type: string, categoryId: number | string) => {
    const idToToggle = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
    setSelectedCategories((prev) => ({
      ...prev,
      [type]: prev[type as keyof typeof prev].map((cat) =>
        cat.id === idToToggle ? { ...cat, isVisible: !cat.isVisible } : cat
      ),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Требуется авторизация', 'error');
        return;
      }

      // Формируем массив настроек для секции rusn
      const rusnSettings = [
        ...selectedCategories.switch.map((cat) => ({
          categoryId: cat.id,
          type: 'switch' as const,
          isVisible: cat.isVisible,
        })),
        ...selectedCategories.rza.map((cat) => ({
          categoryId: cat.id,
          type: 'rza' as const,
          isVisible: cat.isVisible,
        })),
        ...selectedCategories.counter.map((cat) => ({
          categoryId: cat.id,
          type: 'counter' as const,
          isVisible: cat.isVisible,
        })),
        ...selectedCategories.sr.map((cat) => ({
          categoryId: cat.id,
          type: 'sr' as const,
          isVisible: cat.isVisible,
        })),
        ...selectedCategories.tsn.map((cat) => ({
          categoryId: cat.id,
          type: 'tsn' as const,
          isVisible: cat.isVisible,
        })),
        ...selectedCategories.tn.map((cat) => ({
          categoryId: cat.id,
          type: 'tn' as const,
          isVisible: cat.isVisible,
        })),
        ...selectedCategories.tt.map((cat) => ({
          categoryId: cat.id,
          type: 'tt' as const,
          isVisible: cat.isVisible,
        })),
      ];

      // Отправляем только секцию rusn
      const settings = {
        settings: {
          rusn: rusnSettings,
        },
      };

      console.log('Saving settings:', settings);
      console.log('Token:', token);
      console.log('API URL:', `${api}/settings`);

      const updatedSettings = await saveSettings(settings, token);
      console.log('Settings updated:', updatedSettings);

      setHasChanges(false);
      showToast('Настройки успешно сохранены', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      showToast('Ошибка при сохранении настроек', 'error');
    }
  };

  return {
    allCategories,
    selectedCategories,
    loading,
    hasChanges,
    handleAddCategory,
    handleRemoveCategory,
    handleToggleVisibility,
    handleSave,
  };
}
