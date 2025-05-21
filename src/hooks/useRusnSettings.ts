import { useState, useEffect } from 'react';
import { Category } from '@/api/categories';
import { getAllCategories } from '@/api/categories';
import { getSettings, saveSettings } from '@/api/settings';
import { showToast } from '@/shared/modals/ToastProvider';

interface CategorySettings {
  id: number;
  name: string;
  isVisible: boolean;
}

type SettingsType = 'switch' | 'rza' | 'counter';

export function useRusnSettings() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>({
    switch: [],
    rza: [],
    counter: []
  });
  const [loading, setLoading] = useState(true);
  const [currentSettingsId, setCurrentSettingsId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const data = await getAllCategories(token);
      console.log('Fetched categories:', data); // Для отладки
      setAllCategories(data);
    } catch (error: any) {
      showToast(error.message || 'Ошибка при загрузке категорий', 'error');
    }
  };

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const settings = await getSettings(token);
      console.log('Fetched settings:', settings);
      
      if (settings) {
        console.log('Settings:', settings);
        setCurrentSettingsId(settings.id);

        // Проверяем структуру настроек
        if (!settings.settings) {
          console.error('Invalid settings structure:', settings);
          return;
        }

        // Преобразуем настройки в формат для состояния
        const newSelectedCategories = {
          switch: (settings.settings.rusn || []).map(setting => {
            const category = allCategories.find(cat => cat.id === setting.categoryId);
            console.log('Found category for switch:', category, 'setting:', setting);
            return {
              id: setting.categoryId,
              name: category?.name || `Категория ${setting.categoryId}`,
              isVisible: setting.isVisible
            };
          }),
          rza: (settings.settings.runn || []).map(setting => {
            const category = allCategories.find(cat => cat.id === setting.categoryId);
            console.log('Found category for rza:', category, 'setting:', setting);
            return {
              id: setting.categoryId,
              name: category?.name || `Категория ${setting.categoryId}`,
              isVisible: setting.isVisible
            };
          }),
          counter: (settings.settings.bmz || []).map(setting => {
            const category = allCategories.find(cat => cat.id === setting.categoryId);
            console.log('Found category for counter:', category, 'setting:', setting);
            return {
              id: setting.categoryId,
              name: category?.name || `Категория ${setting.categoryId}`,
              isVisible: setting.isVisible
            };
          })
        };

        console.log('Transformed categories:', newSelectedCategories);
        setSelectedCategories(newSelectedCategories);
      } else {
        console.log('No settings found, initializing empty state');
        setSelectedCategories({
          switch: [],
          rza: [],
          counter: []
        });
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      showToast('Ошибка при загрузке настроек', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем настройки после того, как загрузились категории
  useEffect(() => {
    if (allCategories.length > 0) {
      loadSettings();
    }
  }, [allCategories]);

  // Загружаем категории при монтировании
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = (type: SettingsType, categoryId: number) => {
    const category = allCategories.find(cat => cat.id === categoryId);
    if (!category) return;

    // Проверяем, не добавлена ли уже категория в другой тип
    const isAlreadyAdded = Object.values(selectedCategories).some(
      categories => categories.some(cat => cat.id === categoryId)
    );

    if (isAlreadyAdded) {
      showToast('Эта категория уже добавлена в другой раздел', 'error');
      return;
    }

    setSelectedCategories(prev => ({
      ...prev,
      [type]: [...prev[type], { id: category.id, name: category.name, isVisible: true }]
    }));
  };

  const handleRemoveCategory = (type: SettingsType, categoryId: number) => {
    setSelectedCategories(prev => ({
      ...prev,
      [type]: prev[type].filter(cat => cat.id !== categoryId)
    }));
  };

  const handleToggleVisibility = (type: SettingsType, categoryId: number) => {
    setSelectedCategories(prev => ({
      ...prev,
      [type]: prev[type].map(cat => 
        cat.id === categoryId 
          ? { ...cat, isVisible: !cat.isVisible }
          : cat
      )
    }));
  };

  const handleSave = async () => {
    try {
      if (!currentSettingsId) {
        throw new Error('ID настроек не найден');
      }

      const token = localStorage.getItem('token') || '';
      
      const settingsToSave = {
        settings: {
          rusn: selectedCategories.switch.map(category => ({
            categoryId: category.id,
            type: 'switch' as const,
            isVisible: category.isVisible
          })),
          bmz: selectedCategories.counter.map(category => ({
            categoryId: category.id,
            type: 'counter' as const,
            isVisible: category.isVisible
          })),
          runn: selectedCategories.rza.map(category => ({
            categoryId: category.id,
            type: 'rza' as const,
            isVisible: category.isVisible
          }))
        }
      };

      console.log('Saving settings:', settingsToSave);
      await saveSettings(currentSettingsId, settingsToSave, token);
      showToast('Настройки успешно сохранены', 'success');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showToast(error.message || 'Ошибка при сохранении настроек', 'error');
    }
  };

  return {
    allCategories,
    selectedCategories,
    loading,
    handleAddCategory,
    handleRemoveCategory,
    handleToggleVisibility,
    handleSave
  };
} 