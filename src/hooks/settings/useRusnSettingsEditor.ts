import { useState, useEffect, useRef } from 'react';
import { Category } from '@/api/categories';
import { getAllCategories } from '@/api/categories';
import { getSettings } from '@/api/settings/index';
import { writeCategorySettings } from '@/api/settings/writeCategorySettings';
import { showToast } from '@/shared/modals/ToastProvider';
import { invalidateRusnMaterialsCache } from '@/hooks/useRusnMaterials';
import { invalidateRusnCategoriesCache } from '@/domain/rusn/rusnCategoriesLoader';
import { appendSettingsDebugEvent } from '@/utils/settingsDebugLog';

interface RusnCategorySetting {
  id: string;
  name: string;
  visible: boolean;
}

type RusnSectionSettings = {
  switch: RusnCategorySetting[];
  rza: RusnCategorySetting[];
  counter: RusnCategorySetting[];
  sr: RusnCategorySetting[];
  tsn: RusnCategorySetting[];
  tn: RusnCategorySetting[];
  tt: RusnCategorySetting[];
};

const EMPTY_RUSN_SETTINGS: RusnSectionSettings = {
  switch: [],
  rza: [],
  counter: [],
  sr: [],
  tsn: [],
  tn: [],
  tt: [],
};

/**
 * Редактор настроек РУСН — только для страниц /dashboard/settings/rusn и /dashboard/bktp/settings/rusn.
 * Конфигуратор БКТП должен использовать useRusnCategories (только чтение).
 */
export function useRusnSettingsEditor() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<RusnSectionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<RusnSectionSettings | null>(null);

  const settingsRequestIdRef = useRef(0);
  const hasChangesRef = useRef(false);
  const settingsLoadedRef = useRef(false);
  const selectedCategoriesRef = useRef<RusnSectionSettings | null>(null);

  const countRusnCategories = (settings: RusnSectionSettings) =>
    Object.values(settings).reduce((sum, categories) => sum + categories.length, 0);

  const logEvent = (
    reason: string,
    options: {
      details?: string;
      requestId?: number;
      stateBeforeCount?: number;
      stateAfterCount?: number;
      fetchedCount?: number;
    } = {}
  ) => {
    appendSettingsDebugEvent('rusn', reason ? { reason, ...options } : { reason: '—', ...options });
  };

  const canApplyFetchedSettings = (requestId: number, fetched: RusnSectionSettings) => {
    const uiCount = selectedCategoriesRef.current
      ? countRusnCategories(selectedCategoriesRef.current)
      : 0;
    const fetchedCount = countRusnCategories(fetched);

    if (requestId !== settingsRequestIdRef.current) {
      logEvent('Пропущен устаревший ответ РУСН', {
        requestId,
        stateBeforeCount: uiCount,
        fetchedCount,
        details: 'Ответ API пришёл не для последнего запроса и не был применён.',
      });
      return false;
    }
    if (hasChangesRef.current) {
      logEvent('Пропущен ответ РУСН из-за несохранённых изменений', {
        requestId,
        stateBeforeCount: uiCount,
        fetchedCount,
        details: 'Локальные изменения в форме имеют приоритет над пришедшими данными API.',
      });
      return false;
    }

    if (fetchedCount === 0 && uiCount > 0) {
      logEvent('Заблокировано затирание РУСН пустым ответом API', {
        requestId,
        stateBeforeCount: uiCount,
        fetchedCount,
        details: 'Пришёл пустой ответ, но в UI уже были категории. Состояние не перезаписано.',
      });
      return false;
    }

    return true;
  };

  useEffect(() => {
    selectedCategoriesRef.current = selectedCategories;
  }, [selectedCategories]);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Токен не найден');

        const categories = await getAllCategories(token);
        setAllCategories(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        logEvent('Ошибка загрузки справочника категорий РУСН', {
          details: error instanceof Error ? error.message : 'Unknown error',
        });
        showToast('Ошибка при загрузке категорий', 'error');
      }
    };

    fetchAllCategories();
  }, []);

  useEffect(() => {
    const processRusnSettings = (
      apiRusnSettings: { categoryId: number; type: string; isVisible: boolean }[],
      categories: Category[],
      requestId: number
    ) => {
      if (requestId !== settingsRequestIdRef.current || hasChangesRef.current) {
        logEvent('Обработка ответа РУСН отменена до применения', {
          requestId,
          stateBeforeCount: selectedCategoriesRef.current
            ? countRusnCategories(selectedCategoriesRef.current)
            : 0,
          fetchedCount: apiRusnSettings.length,
          details:
            requestId !== settingsRequestIdRef.current
              ? 'Появился более новый запрос.'
              : 'В форме есть несохранённые изменения.',
        });
        return;
      }

      const transformedSettings: RusnSectionSettings = {
        switch: [],
        rza: [],
        counter: [],
        sr: [],
        tsn: [],
        tn: [],
        tt: [],
      };

      apiRusnSettings.forEach((setting) => {
        const categoryId = Number(setting.categoryId);
        const category = categories.find((cat) => cat.id === categoryId);
        const categoryName = category?.name || `Категория ${categoryId}`;

        const categorySetting: RusnCategorySetting = {
          id: String(categoryId),
          name: categoryName,
          visible: setting.isVisible ?? true,
        };

        switch (setting.type) {
          case 'switch':
            transformedSettings.switch.push(categorySetting);
            break;
          case 'rza':
            transformedSettings.rza.push(categorySetting);
            break;
          case 'counter':
            transformedSettings.counter.push(categorySetting);
            break;
          case 'sr':
            transformedSettings.sr.push(categorySetting);
            break;
          case 'tsn':
            transformedSettings.tsn.push(categorySetting);
            break;
          case 'tn':
            transformedSettings.tn.push(categorySetting);
            break;
          case 'tt':
            transformedSettings.tt.push(categorySetting);
            break;
          default:
            console.warn('Неизвестный тип настройки РУСН:', setting.type);
        }
      });

      if (!canApplyFetchedSettings(requestId, transformedSettings)) {
        return;
      }

      const nextCount = countRusnCategories(transformedSettings);
      setSelectedCategories(transformedSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(transformedSettings)));
      settingsLoadedRef.current = true;
      logEvent('Применены настройки РУСН из API', {
        requestId,
        stateBeforeCount: selectedCategoriesRef.current
          ? countRusnCategories(selectedCategoriesRef.current)
          : 0,
        stateAfterCount: nextCount,
        fetchedCount: nextCount,
      });
    };

    const fetchSettings = async () => {
      const requestId = ++settingsRequestIdRef.current;
      logEvent('Запрошены настройки РУСН', {
        requestId,
        stateBeforeCount: selectedCategoriesRef.current
          ? countRusnCategories(selectedCategoriesRef.current)
          : 0,
      });

      try {
        if (!selectedCategories) {
          setLoading(true);
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Токен не найден');

        const settings = await getSettings(token);

        if (requestId !== settingsRequestIdRef.current) {
          logEvent('Игнорирован устаревший fetch РУСН после getSettings', {
            requestId,
            details: 'Пока шёл запрос, был запущен более новый.',
          });
          return;
        }

        if (settings.settings?.rusn) {
          processRusnSettings(settings.settings.rusn, allCategories, requestId);
        } else if (
          !hasChangesRef.current &&
          !selectedCategoriesRef.current &&
          requestId === settingsRequestIdRef.current
        ) {
          setSelectedCategories(EMPTY_RUSN_SETTINGS);
          setOriginalSettings(JSON.parse(JSON.stringify(EMPTY_RUSN_SETTINGS)));
          settingsLoadedRef.current = true;
          logEvent('Настройки РУСН сброшены в пустое состояние', {
            requestId,
            stateBeforeCount: 0,
            stateAfterCount: 0,
            fetchedCount: 0,
            details: 'В ответе API отсутствовал блок settings.rusn при первой загрузке.',
          });
        }
      } catch (error) {
        console.error('Error fetching RUSN settings:', error);
        logEvent('Ошибка загрузки настроек РУСН', {
          requestId,
          details: error instanceof Error ? error.message : 'Unknown error',
        });
        showToast('Ошибка при загрузке настроек', 'error');

        if (requestId !== settingsRequestIdRef.current || hasChangesRef.current) {
          return;
        }

        if (!selectedCategoriesRef.current) {
          setSelectedCategories(EMPTY_RUSN_SETTINGS);
          setOriginalSettings(JSON.parse(JSON.stringify(EMPTY_RUSN_SETTINGS)));
          settingsLoadedRef.current = true;
          logEvent('Настройки РУСН сброшены в пустое состояние после ошибки', {
            requestId,
            stateAfterCount: 0,
            details: 'После ошибки загрузки форма инициализирована пустым состоянием.',
          });
        }
      } finally {
        if (requestId === settingsRequestIdRef.current) {
          setLoading(false);
        }
      }
    };

    if (allCategories.length === 0) return;
    if (settingsLoadedRef.current) return;

    fetchSettings();
  }, [allCategories.length]);

  useEffect(() => {
    if (selectedCategories && originalSettings) {
      const changed =
        JSON.stringify(selectedCategories) !== JSON.stringify(originalSettings);
      hasChangesRef.current = changed;
      setHasChanges(changed);
    }
  }, [selectedCategories, originalSettings]);

  const buildRusnSettingsPayload = (settings: RusnSectionSettings) => {
    const rusnSettings: {
      categoryId: number;
      type: 'switch' | 'rza' | 'counter' | 'sr' | 'tsn' | 'tn' | 'tt';
      isVisible: boolean;
    }[] = [];

    (Object.entries(settings) as [keyof RusnSectionSettings, RusnCategorySetting[]][]).forEach(
      ([type, categories]) => {
        categories.forEach((category) => {
          const apiCategory = allCategories.find((cat) => cat.name === category.name);
          const categoryId = apiCategory?.id ?? Number(category.id);

          if (!Number.isNaN(categoryId) && categoryId > 0) {
            rusnSettings.push({
              categoryId,
              type,
              isVisible: category.visible,
            });
          }
        });
      }
    );

    return rusnSettings;
  };

  const persistRusnSettings = async (
    settings: RusnSectionSettings,
    options: { successMessage?: string; silent?: boolean } = {}
  ) => {
    settingsRequestIdRef.current += 1;
    logEvent('Запущено сохранение настроек РУСН', {
      requestId: settingsRequestIdRef.current,
      stateBeforeCount: countRusnCategories(settings),
    });

    const token = localStorage.getItem('token');
    if (!token) {
      logEvent('Сохранение РУСН прервано: нет токена', {
        requestId: settingsRequestIdRef.current,
      });
      showToast('Ошибка авторизации', 'error');
      throw new Error('Токен не найден');
    }

    const rusnSettings = buildRusnSettingsPayload(settings);
    const totalInUi = countRusnCategories(settings);

    if (totalInUi > 0 && rusnSettings.length === 0) {
      logEvent('Сохранение РУСН отклонено: категории не преобразовались в payload', {
        requestId: settingsRequestIdRef.current,
        stateBeforeCount: totalInUi,
        fetchedCount: rusnSettings.length,
      });
      showToast('Не удалось сохранить: проверьте выбранные категории', 'error');
      throw new Error('Invalid category ids');
    }

    await writeCategorySettings({ settings: { rusn: rusnSettings } }, token);

    settingsLoadedRef.current = true;
    hasChangesRef.current = false;
    setHasChanges(false);
    setSelectedCategories(settings);
    setOriginalSettings(JSON.parse(JSON.stringify(settings)));
    invalidateRusnMaterialsCache();
    invalidateRusnCategoriesCache();
    logEvent('Настройки РУСН успешно сохранены', {
      requestId: settingsRequestIdRef.current,
      stateAfterCount: countRusnCategories(settings),
    });

    if (!options.silent) {
      showToast(options.successMessage ?? 'Настройки успешно сохранены', 'success');
    }
  };

  const handleAddCategory = async (type: string, categoryId: number | string) => {
    if (!selectedCategories) return;

    const category = allCategories.find((cat) =>
      typeof categoryId === 'number' || !Number.isNaN(Number(categoryId))
        ? cat.id === Number(categoryId)
        : cat.name === categoryId
    );

    if (!category) {
      showToast('Категория не найдена', 'error');
      return;
    }

    const isAlreadyAdded = Object.values(selectedCategories).some((categories) =>
      categories.some((cat) => cat.id === String(category.id))
    );

    if (isAlreadyAdded) {
      showToast('Эта категория уже добавлена в другой раздел', 'error');
      return;
    }

    const newCategories: RusnSectionSettings = {
      ...selectedCategories,
      [type as keyof RusnSectionSettings]: [
        ...selectedCategories[type as keyof RusnSectionSettings],
        { id: String(category.id), name: category.name, visible: true },
      ],
    };

    setSelectedCategories(newCategories);
  };

  const handleRemoveCategory = async (type: string, categoryId: string) => {
    if (!selectedCategories) return;

    const normalizedId = String(categoryId);
    const newCategories: RusnSectionSettings = {
      ...selectedCategories,
      [type as keyof RusnSectionSettings]: selectedCategories[
        type as keyof RusnSectionSettings
      ].filter((cat) => String(cat.id) !== normalizedId),
    };

    setSelectedCategories(newCategories);
  };

  const handleToggleVisibility = async (type: string, categoryId: string) => {
    if (!selectedCategories) return;

    const normalizedId = String(categoryId);
    const newCategories: RusnSectionSettings = {
      ...selectedCategories,
      [type as keyof RusnSectionSettings]: selectedCategories[type as keyof RusnSectionSettings].map(
        (cat) =>
          String(cat.id) === normalizedId ? { ...cat, visible: !cat.visible } : cat
      ),
    };

    setSelectedCategories(newCategories);
  };

  const handleSave = async () => {
    if (!selectedCategories) return;

    try {
      await persistRusnSettings(selectedCategories);
    } catch (error) {
      console.error('Error saving settings:', error);
      logEvent('Ошибка сохранения настроек РУСН', {
        requestId: settingsRequestIdRef.current,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
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
