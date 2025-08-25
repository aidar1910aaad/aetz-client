import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/api/settings/index';
import { getAllCategories, Category } from '@/api/categories';
import { showToast } from '@/shared/modals/ToastProvider';

interface CategorySetting {
  id: string;
  name: string;
  visible: boolean;
}

interface RunnSettings {
  avtomatVyk: CategorySetting[];
  avtomatLity: CategorySetting[];
  counter: CategorySetting[];
  rpsLeft: CategorySetting[];
}

interface AllCategories {
  avtomatVyk: string[];
  avtomatLity: string[];
  counter: string[];
  rpsLeft: string[];
}

export function useRunnSettings() {
  const [allCategories, setAllCategories] = useState<AllCategories>({
    avtomatVyk: [],
    avtomatLity: [],
    counter: [],
    rpsLeft: [],
  });
  const [selectedCategories, setSelectedCategories] = useState<RunnSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<RunnSettings | null>(null);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);

  // Загрузка всех доступных категорий из API
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Токен не найден');
          return;
        }

        console.log('=== БКТП РУНН: Загрузка категорий из API ===');
        const categories = await getAllCategories(token);
        console.log('Полученные категории:', categories);
        setApiCategories(categories);

        // Все категории доступны для выбора в каждой секции
        const allCategoryNames = categories.map((cat) => cat.name);
        const categorized: AllCategories = {
          avtomatVyk: allCategoryNames,
          avtomatLity: allCategoryNames,
          counter: allCategoryNames,
          rpsLeft: allCategoryNames,
        };

        console.log('Все категории доступны для выбора:', categorized);
        setAllCategories(categorized);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);

        // При ошибке показываем пустые категории
        const emptyCategories: AllCategories = {
          avtomatVyk: [],
          avtomatLity: [],
          counter: [],
          rpsLeft: [],
        };
        setAllCategories(emptyCategories);
      }
    };

    fetchAllCategories();
  }, []);

  // Загрузка текущих настроек
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);

        // Получаем токен из localStorage
        const token = localStorage.getItem('token');
        console.log('=== БКТП РУНН: Отправка GET запроса к API ===');
        console.log('Token:', token ? 'Present' : 'Missing');

        if (!token) {
          console.error('Токен не найден в localStorage');
          throw new Error('Токен не найден');
        }

        // Выполняем GET запрос к API
        const apiResponse = await getSettings(token);
        console.log('=== БКТП РУНН: Ответ от API ===');
        console.log('Полный ответ API:', apiResponse);
        console.log('Структура ответа:', Object.keys(apiResponse));
        console.log('Настройки РУНН в ответе:', apiResponse.settings?.runn);
        console.log('Количество настроек РУНН:', apiResponse.settings?.runn?.length || 0);
        console.log('Тип настроек РУНН:', typeof apiResponse.settings?.runn);

        // Обрабатываем настройки РУНН (если они есть)
        if (apiResponse.settings?.runn && apiResponse.settings.runn.length > 0) {
          console.log('Настройки РУНН существуют, обрабатываем их...');
          await processRunnSettings(apiResponse.settings.runn, apiCategories);
        } else {
          console.log('Настройки РУНН пустые, показываем пустые секции...');

          // Показываем пустые секции (пользователь сам добавит категории)
          const emptySettings: RunnSettings = {
            avtomatVyk: [],
            avtomatLity: [],
            counter: [],
          };

          console.log('Пустые настройки РУНН:', emptySettings);
          setSelectedCategories(emptySettings);
          setOriginalSettings(JSON.parse(JSON.stringify(emptySettings)));
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек БКТП РУНН:', error);

        // В случае ошибки показываем пустые настройки
        const emptySettings: RunnSettings = {
          avtomatVyk: [],
          avtomatLity: [],
          counter: [],
        };

        setSelectedCategories(emptySettings);
        setOriginalSettings(JSON.parse(JSON.stringify(emptySettings)));
      } finally {
        setLoading(false);
      }
    };

    const processRunnSettings = async (
      apiRunnSettings: { categoryId: number; type: string; isVisible: boolean }[],
      categories: Category[]
    ) => {
      // Преобразуем API формат в наш формат
      const transformedSettings: RunnSettings = {
        avtomatVyk: [],
        avtomatLity: [],
        counter: [],
        rpsLeft: [],
      };

      // Группируем настройки по типам и находим названия категорий
      apiRunnSettings.forEach(
        (setting: { categoryId: number; type: string; isVisible: boolean }) => {
          const category = categories.find((cat) => cat.id === setting.categoryId);
          const categoryName = category?.name || `Категория ${setting.categoryId}`;

          const categorySetting: CategorySetting = {
            id: setting.categoryId.toString(),
            name: categoryName,
            visible: setting.isVisible || false,
          };

          switch (setting.type) {
            case 'avtomatVyk':
              transformedSettings.avtomatVyk.push(categorySetting);
              break;
            case 'avtomatLity':
              transformedSettings.avtomatLity.push(categorySetting);
              break;
            case 'counter':
              transformedSettings.counter.push(categorySetting);
              break;
            case 'rpsLeft':
              transformedSettings.rpsLeft.push(categorySetting);
              break;
            default:
              console.warn('Неизвестный тип настройки:', setting.type);
          }
        }
      );

      console.log('Преобразованные настройки РУНН:', transformedSettings);
      setSelectedCategories(transformedSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(transformedSettings)));
    };

    fetchSettings();
  }, [apiCategories, allCategories]);

  // Проверка изменений
  useEffect(() => {
    if (selectedCategories && originalSettings) {
      const hasChanges = JSON.stringify(selectedCategories) !== JSON.stringify(originalSettings);
      setHasChanges(hasChanges);
    }
  }, [selectedCategories, originalSettings]);

  const handleAddCategory = (type: keyof RunnSettings, categoryId: string | number) => {
    if (!selectedCategories) return;

    let categoryName: string;
    let categoryIdStr: string;

    // Проверяем, является ли categoryId числом (из API) или строкой (из моковых данных)
    if (typeof categoryId === 'number' || !isNaN(Number(categoryId))) {
      // Это ID из API
      const apiCategory = apiCategories.find((cat) => cat.id === Number(categoryId));
      if (!apiCategory) {
        console.error('Категория не найдена по ID:', categoryId);
        return;
      }
      categoryName = apiCategory.name;
      categoryIdStr = apiCategory.id.toString();
    } else {
      // Это строка из моковых данных
      categoryName = categoryId as string;
      categoryIdStr = Date.now().toString();
    }

    // Проверяем, не добавлена ли уже эта категория в другой раздел
    const isAlreadyAdded = Object.values(selectedCategories).some((categories) =>
      categories.some((cat) => cat.name === categoryName)
    );

    if (isAlreadyAdded) {
      return;
    }

    const newCategory: CategorySetting = {
      id: categoryIdStr,
      name: categoryName,
      visible: true,
    };

    setSelectedCategories((prev) => ({
      ...prev!,
      [type]: [...prev![type], newCategory],
    }));
    setHasChanges(true);
  };

  const handleRemoveCategory = (type: keyof RunnSettings, categoryId: string) => {
    if (!selectedCategories) return;

    const categoryToRemove = selectedCategories[type].find((cat) => cat.id === categoryId);
    if (!categoryToRemove) return;

    setSelectedCategories((prev) => ({
      ...prev!,
      [type]: prev![type].filter((cat) => cat.id !== categoryId),
    }));
    setHasChanges(true);
  };

  const handleToggleVisibility = (type: keyof RunnSettings, categoryId: string) => {
    if (!selectedCategories) return;

    const categoryToToggle = selectedCategories[type].find((cat) => cat.id === categoryId);
    if (!categoryToToggle) return;

    const newVisible = !categoryToToggle.visible;

    setSelectedCategories((prev) => ({
      ...prev!,
      [type]: prev![type].map((cat) =>
        cat.id === categoryId ? { ...cat, visible: newVisible } : cat
      ),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedCategories) {
      console.error('selectedCategories is null or undefined');
      showToast('Ошибка: нет данных для сохранения', 'error');
      return;
    }

    try {
      console.log('=== БКТП РУНН: Сохранение настроек ===');
      console.log('Настройки для сохранения:', selectedCategories);
      console.log('API категории:', apiCategories);

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен не найден в localStorage');
        showToast('Ошибка авторизации', 'error');
        return;
      }

      // Получаем текущие настройки из API
      console.log('Получаем текущие настройки из API...');
      const currentSettings = await getSettings(token);
      console.log('Текущие настройки из API:', currentSettings);

      // Преобразуем наши настройки в формат API
      const runnSettings = [];

      // Собираем все категории из всех типов
      Object.entries(selectedCategories).forEach(([type, categories]) => {
        console.log(`Обрабатываем тип ${type}:`, categories);
        categories.forEach((category) => {
          console.log(`Обрабатываем категорию:`, category);

          // Сначала пытаемся найти категорию по названию в API
          const apiCategory = apiCategories.find((cat) => cat.name === category.name);
          console.log(`Найдена в API:`, apiCategory);

          // Если не найдена в API, используем ID из category (для моковых данных)
          if (!apiCategory) {
            // Для моковых данных используем ID как есть
            const categoryId = parseInt(category.id);
            console.log(`Используем ID из моковых данных:`, categoryId);
            if (!isNaN(categoryId)) {
              runnSettings.push({
                categoryId: categoryId,
                type: type as 'avtomatVyk' | 'avtomatLity' | 'counter',
                isVisible: category.visible,
              });
            }
          } else {
            // Для API данных используем найденный ID
            console.log(`Используем ID из API:`, apiCategory.id);
            runnSettings.push({
              categoryId: apiCategory.id,
              type: type as 'avtomatVyk' | 'avtomatLity' | 'counter',
              isVisible: category.visible,
            });
          }
        });
      });

      console.log('Преобразованные настройки для API:', runnSettings);

      if (runnSettings.length === 0) {
        console.warn('Нет настроек для сохранения');
        showToast('Нет изменений для сохранения', 'error');
        return;
      }

      // Обновляем настройки в API
      const updatedSettings = {
        ...currentSettings,
        settings: {
          ...currentSettings.settings,
          runn: runnSettings,
        },
      };

      console.log('Обновленные настройки для сохранения:', updatedSettings);

      // Сохраняем в API
      console.log('Отправляем запрос на сохранение...');
      const result = await saveSettings(updatedSettings, token);
      console.log('Результат сохранения:', result);

      // Обновляем оригинальные настройки
      setOriginalSettings(JSON.parse(JSON.stringify(selectedCategories)));
      setHasChanges(false);

      // Уведомление об успешном сохранении
      showToast('Настройки успешно сохранены', 'success');
    } catch (error) {
      console.error('Ошибка сохранения настроек БКТП РУНН:', error);
      if (error instanceof Error) {
        console.error('Детали ошибки:', {
          message: error.message,
          stack: error.stack,
        });
        showToast(`Ошибка при сохранении: ${error.message}`, 'error');
      } else {
        showToast('Ошибка при сохранении настроек', 'error');
      }
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
