import { useState, useEffect, useRef } from 'react';
import { getSettings, saveSettings } from '@/api/settings/index';
import { getAllCategories, Category } from '@/api/categories';
import { getMaterialsByCategoryId } from '@/api/material/index';
import { showToast } from '@/shared/modals/ToastProvider';
import { invalidateRunnMaterialsCache } from '@/hooks/useRunnMaterials';

interface CategorySetting {
  id: string;
  name: string;
  visible: boolean;
}

interface Material {
  code: string;
  id: number;
  name: string;
  unit: string;
  price: number | string;
  category: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface RunnSettings {
  avtomatVyk: CategorySetting[];
  avtomatLity: CategorySetting[];
  counter: CategorySetting[];
  rpsLeft: CategorySetting[];
  fusesPn: CategorySetting[];
  currentTransformer: CategorySetting[];
  moldedCaseSwitch: CategorySetting[];
}

interface AllCategories {
  avtomatVyk: string[];
  avtomatLity: string[];
  counter: string[];
  rpsLeft: string[];
  fusesPn: string[];
  currentTransformer: string[];
  moldedCaseSwitch: string[];
}

interface RunnMaterials {
  avtomatVyk: Material[];
  avtomatLity: Material[];
  counter: Material[];
  rpsLeft: Material[];
  fusesPn: Material[];
  currentTransformer: Material[];
  moldedCaseSwitch: Material[];
}

interface UseRunnSettingsOptions {
  /** На странице конфигуратора достаточно useRunnMaterials — не дублировать запросы */
  skipMaterialsLoad?: boolean;
}

export function useRunnSettings(options: UseRunnSettingsOptions = {}) {
  const { skipMaterialsLoad = false } = options;
  const [allCategories, setAllCategories] = useState<AllCategories>({
    avtomatVyk: [],
    avtomatLity: [],
    counter: [],
    rpsLeft: [],
    fusesPn: [],
    currentTransformer: [],
    moldedCaseSwitch: [],
  });
  const [selectedCategories, setSelectedCategories] = useState<RunnSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<RunnSettings | null>(null);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<RunnMaterials>({
    avtomatVyk: [],
    avtomatLity: [],
    counter: [],
    rpsLeft: [],
    fusesPn: [],
    currentTransformer: [],
    moldedCaseSwitch: [],
  });

  // Ref для отслеживания предыдущего состояния видимости категорий
  const prevVisibilityRef = useRef<string>('');
  const settingsRequestIdRef = useRef(0);
  const hasChangesRef = useRef(false);
  const settingsLoadedRef = useRef(false);
  const selectedCategoriesRef = useRef<RunnSettings | null>(null);

  useEffect(() => {
    selectedCategoriesRef.current = selectedCategories;
  }, [selectedCategories]);

  // Загрузка всех доступных категорий из API
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Токен не найден');
          return;
        }

        const categories = await getAllCategories(token);
        setApiCategories(categories);

        // Все категории доступны для выбора в каждой секции
        const allCategoryNames = categories.map((cat) => cat.name);
        const categorized: AllCategories = {
          avtomatVyk: allCategoryNames,
          avtomatLity: allCategoryNames,
          counter: allCategoryNames,
          rpsLeft: allCategoryNames,
          fusesPn: allCategoryNames,
          currentTransformer: allCategoryNames,
          moldedCaseSwitch: allCategoryNames,
        };


        setAllCategories(categorized);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);

        // При ошибке показываем пустые категории
        const emptyCategories: AllCategories = {
          avtomatVyk: [],
          avtomatLity: [],
          counter: [],
          rpsLeft: [],
          fusesPn: [],
          currentTransformer: [],
          moldedCaseSwitch: [],
        };
        setAllCategories(emptyCategories);
      }
    };

    fetchAllCategories();
  }, []);

  // Функция загрузки материалов для категорий
  const loadMaterialsForCategories = async (settings: RunnSettings, token: string) => {
    const newMaterials: RunnMaterials = {
      avtomatVyk: [],
      avtomatLity: [],
      counter: [],
      rpsLeft: [],
      fusesPn: [],
      currentTransformer: [],
      moldedCaseSwitch: [],
    };

    // Загружаем материалы для каждого типа категорий
    const materialPromises = Object.entries(settings).map(async ([type, categories]) => {
      const visibleCategories = categories.filter(cat => cat.visible);
      
      // Фильтруем категории с неправильными ID
      const validCategories = visibleCategories.filter(cat => {
        const id = parseInt(cat.id);
        const isValid = !isNaN(id) && id > 0 && id <= 2147483647;
        if (!isValid) {
          console.error(`Найдена категория с неправильным ID ${cat.id} (${cat.name}), удаляем из списка`);
        }
        return isValid;
      });
      
      const categoryIds = validCategories.map(cat => parseInt(cat.id));
      
      
      for (const categoryId of categoryIds) {
        // Проверяем валидность ID перед запросом
        if (isNaN(categoryId) || categoryId <= 0 || categoryId > 2147483647) {
          console.error(`Неправильный ID категории: ${categoryId} (тип: ${type}). Пропускаем загрузку.`);
          console.error(`Категория с проблемным ID:`, categories.find(cat => parseInt(cat.id) === categoryId));
          continue;
        }

        try {
          const categoryMaterials = await getMaterialsByCategoryId(categoryId, token);
          newMaterials[type as keyof RunnMaterials].push(...categoryMaterials);
          
        } catch (error) {
          console.error(`Ошибка загрузки материалов для категории ${categoryId} (тип: ${type}):`, error);
          console.error(`Детали ошибки:`, {
            categoryId,
            type,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined
          });
        }
      }
    });

    await Promise.all(materialPromises);
    
    // Отладочная информация для avtomatVyk
    if (newMaterials.avtomatVyk.length > 0) {
      
      // Проверяем наличие материалов с током 2500A и 2000A
      const current2500 = newMaterials.avtomatVyk.filter(m => 
        m.name && (
          m.name.includes('2500А') || // кириллическая А
          m.name.includes('2500 А') || // кириллическая А с пробелом
          m.name.includes('2500A') || // латинская A
          m.name.includes('2500 A') || // латинская A с пробелом
          m.name.includes('2500ампер') ||
          m.name.includes('2500 amp')
        )
      );
      
      const current2000 = newMaterials.avtomatVyk.filter(m => 
        m.name && (
          m.name.includes('2000А') || // кириллическая А
          m.name.includes('2000 А') || // кириллическая А с пробелом
          m.name.includes('2000A') || // латинская A
          m.name.includes('2000 A') || // латинская A с пробелом
          m.name.includes('2000ампер') ||
          m.name.includes('2000 amp')
        )
      );
      
    }
    
    setMaterials(newMaterials);
  };

  // Загрузка текущих настроек
  useEffect(() => {
    const fetchSettings = async () => {
      const requestId = ++settingsRequestIdRef.current;

      try {
        // Не показываем лоадер повторно — иначе форма размонтируется и теряется ввод
        if (!selectedCategories) {
          setLoading(true);
        }

        // Получаем токен из localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('Токен не найден в localStorage');
          throw new Error('Токен не найден');
        }
        
        // Выполняем GET запрос к API
        const apiResponse = await getSettings(token);

        if (requestId !== settingsRequestIdRef.current) return;

        // Обрабатываем настройки РУНН (если они есть)
        if (apiResponse.settings?.runn && apiResponse.settings.runn.length > 0) {
          await processRunnSettings(apiResponse.settings.runn, apiCategories, requestId);
        } else if (!hasChangesRef.current && !selectedCategoriesRef.current) {
          // Пустое состояние только при первой загрузке, без уже выбранных категорий
          const emptySettings: RunnSettings = {
            avtomatVyk: [],
            avtomatLity: [],
            counter: [],
            rpsLeft: [],
            fusesPn: [],
            currentTransformer: [],
            moldedCaseSwitch: [],
          };

          setSelectedCategories(emptySettings);
          setOriginalSettings(JSON.parse(JSON.stringify(emptySettings)));
          settingsLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек РУНН:', error);

        if (requestId !== settingsRequestIdRef.current || hasChangesRef.current) {
          return;
        }

        if (!selectedCategoriesRef.current) {
          const emptySettings: RunnSettings = {
            avtomatVyk: [],
            avtomatLity: [],
            counter: [],
            rpsLeft: [],
            fusesPn: [],
            currentTransformer: [],
            moldedCaseSwitch: [],
          };

          setSelectedCategories(emptySettings);
          setOriginalSettings(JSON.parse(JSON.stringify(emptySettings)));
          settingsLoadedRef.current = true;
        }
      } finally {
        if (requestId === settingsRequestIdRef.current) {
          setLoading(false);
        }
      }
    };

    const processRunnSettings = async (
      apiRunnSettings: { categoryId: number; type: string; isVisible: boolean }[],
      categories: Category[],
      requestId: number
    ) => {
      if (requestId !== settingsRequestIdRef.current || hasChangesRef.current) {
        return;
      }

      // Преобразуем API формат в наш формат
      const transformedSettings: RunnSettings = {
        avtomatVyk: [],
        avtomatLity: [],
        counter: [],
        rpsLeft: [],
        fusesPn: [],
        currentTransformer: [],
        moldedCaseSwitch: [],
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
            case 'fusesPn':
              transformedSettings.fusesPn.push(categorySetting);
              break;
            case 'currentTransformer':
              transformedSettings.currentTransformer.push(categorySetting);
              break;
            case 'moldedCaseSwitch':
              transformedSettings.moldedCaseSwitch.push(categorySetting);
              break;
            default:
              console.warn('Неизвестный тип настройки:', setting.type);
          }
        }
      );


      setSelectedCategories(transformedSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(transformedSettings)));
      settingsLoadedRef.current = true;
      
      if (!skipMaterialsLoad) {
        const token = localStorage.getItem('token');
        if (token) {
          await loadMaterialsForCategories(transformedSettings, token);
        }
      }
    };

    if (apiCategories.length === 0) return;
    if (settingsLoadedRef.current) return;

    fetchSettings();
  }, [apiCategories.length, skipMaterialsLoad]);

  // Проверка изменений
  useEffect(() => {
    if (selectedCategories && originalSettings) {
      const changed =
        JSON.stringify(selectedCategories) !== JSON.stringify(originalSettings);
      hasChangesRef.current = changed;
      setHasChanges(changed);
    }
  }, [selectedCategories, originalSettings]);

  useEffect(() => {
    if (skipMaterialsLoad) return;
    if (selectedCategories) {
      const token = localStorage.getItem('token');
      if (token) {
        // Создаем строку с информацией о видимости категорий для сравнения
        const currentVisibility = Object.entries(selectedCategories)
          .map(([type, categories]) => 
            `${type}:${categories.map(cat => `${cat.id}:${cat.visible}`).join(',')}`
          )
          .join('|');
        
        // Проверяем, изменилась ли видимость категорий
        if (prevVisibilityRef.current !== currentVisibility) {
          
          // Обновляем ref
          prevVisibilityRef.current = currentVisibility;
          
          // Перезагружаем материалы
          loadMaterialsForCategories(selectedCategories, token);
        }
      }
    }
  }, [selectedCategories]);

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
      // Это строка из моковых данных - ищем категорию по названию
      categoryName = categoryId as string;
      const apiCategory = apiCategories.find((cat) => cat.name === categoryName);
      
      if (apiCategory) {
        // Используем ID из API
        categoryIdStr = apiCategory.id.toString();
      } else {
        console.error(`Категория "${categoryName}" не найдена в API. Пропускаем добавление.`);
        return;
      }
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

    hasChangesRef.current = true;
    setHasChanges(true);

    setSelectedCategories((prev) => {
      const newCategories = {
        ...prev!,
        [type]: [...prev![type], newCategory],
      };
      
      // Принудительно перезагружаем материалы после добавления категории
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          loadMaterialsForCategories(newCategories, token);
        }
      }, 100);
      
      return newCategories;
    });
  };

  const handleRemoveCategory = async (type: keyof RunnSettings, categoryId: string) => {
    if (!selectedCategories) return;

    const normalizedId = String(categoryId);
    const categoryToRemove = selectedCategories[type].find(
      (cat) => String(cat.id) === normalizedId
    );
    if (!categoryToRemove) return;

    const newCategories: RunnSettings = {
      ...selectedCategories,
      [type]: selectedCategories[type].filter((cat) => String(cat.id) !== normalizedId),
    };

    hasChangesRef.current = true;
    setHasChanges(true);
    setSelectedCategories(newCategories);

    if (!skipMaterialsLoad) {
      const token = localStorage.getItem('token');
      if (token) {
        loadMaterialsForCategories(newCategories, token);
      }
    }

    try {
      await persistRunnSettings(newCategories, { successMessage: 'Категория удалена' });
    } catch {
      // persistRunnSettings уже показывает toast об ошибке
    }
  };

  const handleToggleVisibility = (type: keyof RunnSettings, categoryId: string) => {
    if (!selectedCategories) return;

    const normalizedId = String(categoryId);
    const categoryToToggle = selectedCategories[type].find(
      (cat) => String(cat.id) === normalizedId
    );
    if (!categoryToToggle) return;

    const newVisible = !categoryToToggle.visible;
    

    hasChangesRef.current = true;
    setHasChanges(true);

    setSelectedCategories((prev) => {
      const newCategories = {
        ...prev!,
        [type]: prev![type].map((cat) =>
          String(cat.id) === normalizedId ? { ...cat, visible: newVisible } : cat
        ),
      };
      
      // Принудительно перезагружаем материалы после изменения
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          loadMaterialsForCategories(newCategories, token);
        }
      }, 100); // Небольшая задержка для гарантии обновления состояния
      
      return newCategories;
    });
  };

  const buildRunnSettingsPayload = (settings: RunnSettings) => {
    const runnSettings: {
      categoryId: number;
      type: string;
      isVisible: boolean;
    }[] = [];

    Object.entries(settings).forEach(([type, categories]) => {
      categories.forEach((category) => {
        const apiCategory = apiCategories.find((cat) => cat.name === category.name);

        if (!apiCategory) {
          const categoryId = parseInt(category.id, 10);

          if (!isNaN(categoryId) && categoryId > 0 && categoryId <= 2147483647) {
            runnSettings.push({
              categoryId,
              type,
              isVisible: category.visible,
            });
          } else {
            console.warn(
              `Неправильный ID категории: ${category.id} (${category.name}). ID должен быть числом от 1 до 2147483647.`
            );
          }
        } else {
          runnSettings.push({
            categoryId: apiCategory.id,
            type,
            isVisible: category.visible,
          });
        }
      });
    });

    return runnSettings;
  };

  const persistRunnSettings = async (
    settings: RunnSettings,
    options: { successMessage?: string } = {}
  ) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Ошибка авторизации', 'error');
      throw new Error('Токен не найден');
    }

    const runnSettings = buildRunnSettingsPayload(settings);
    const totalInUi = Object.values(settings).reduce((sum, categories) => sum + categories.length, 0);

    if (totalInUi > 0 && runnSettings.length === 0) {
      showToast('Не удалось сохранить: проверьте выбранные категории', 'error');
      throw new Error('Invalid category ids');
    }

    const updatedSettings = {
      settings: {
        runn: runnSettings,
      },
    };

    await saveSettings(updatedSettings, token);

    setSelectedCategories(settings);
    setOriginalSettings(JSON.parse(JSON.stringify(settings)));
    hasChangesRef.current = false;
    setHasChanges(false);
    invalidateRunnMaterialsCache();

    showToast(options.successMessage ?? 'Настройки успешно сохранены', 'success');
  };

  const handleSave = async () => {
    if (!selectedCategories) {
      console.error('selectedCategories is null or undefined');
      showToast('Ошибка: нет данных для сохранения', 'error');
      return;
    }

    if (!hasChangesRef.current) {
      showToast('Нет изменений для сохранения', 'error');
      return;
    }

    try {
      await persistRunnSettings(selectedCategories);
    } catch (error) {
      console.error('Ошибка сохранения настроек БКТП РУНН:', error);
      if (error instanceof Error && error.message !== 'Invalid category ids') {
        showToast(`Ошибка при сохранении: ${error.message}`, 'error');
      } else if (!(error instanceof Error)) {
        showToast('Ошибка при сохранении настроек', 'error');
      }
    }
  };

  // Функция для принудительной перезагрузки материалов
  const reloadMaterials = () => {
    if (selectedCategories) {
      const token = localStorage.getItem('token');
      if (token) {
        loadMaterialsForCategories(selectedCategories, token);
      }
    }
  };

  return {
    allCategories,
    selectedCategories,
    materials,
    loading,
    hasChanges,
    handleAddCategory,
    handleRemoveCategory,
    handleToggleVisibility,
    handleSave,
    reloadMaterials,
  };
};
