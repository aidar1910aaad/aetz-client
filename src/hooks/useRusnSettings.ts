import { useState, useEffect, useRef } from 'react';
import { Category } from '@/api/categories';
import { getAllCategories } from '@/api/categories';
import { getSettings, saveSettings } from '@/api/settings/index';
import { showToast } from '@/shared/modals/ToastProvider';
import { RusnSettings, fetchCategories, fetchRusnSettings } from '@/utils/rusnSettings';
import { invalidateRusnMaterialsCache } from '@/hooks/useRusnMaterials';

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

        const categories = await fetchCategories(token);
        setAllCategories(categories);

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

  const canApplyFetchedSettings = (requestId: number, fetched: RusnSectionSettings) => {
    if (requestId !== settingsRequestIdRef.current) return false;
    if (hasChangesRef.current) return false;

    const uiCount = selectedCategoriesRef.current
      ? countRusnCategories(selectedCategoriesRef.current)
      : 0;
    const fetchedCount = countRusnCategories(fetched);

    if (fetchedCount === 0 && uiCount > 0) return false;

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

      setSelectedCategories(transformedSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(transformedSettings)));
      settingsLoadedRef.current = true;
    };

    const fetchSettings = async () => {
      const requestId = ++settingsRequestIdRef.current;

      try {
        if (!selectedCategories) {
          setLoading(true);
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Токен не найден');

        const settings = await getSettings(token);

        if (requestId !== settingsRequestIdRef.current) return;

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
        }
      } catch (error) {
        console.error('Error fetching RUSN settings:', error);
        showToast('Ошибка при загрузке настроек', 'error');

        if (requestId !== settingsRequestIdRef.current || hasChangesRef.current) {
          return;
        }

        if (!selectedCategoriesRef.current) {
          setSelectedCategories(EMPTY_RUSN_SETTINGS);
          setOriginalSettings(JSON.parse(JSON.stringify(EMPTY_RUSN_SETTINGS)));
          settingsLoadedRef.current = true;
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

    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Ошибка авторизации', 'error');
      throw new Error('Токен не найден');
    }

    const rusnSettings = buildRusnSettingsPayload(settings);
    const totalInUi = countRusnCategories(settings);

    if (totalInUi > 0 && rusnSettings.length === 0) {
      showToast('Не удалось сохранить: проверьте выбранные категории', 'error');
      throw new Error('Invalid category ids');
    }

    await saveSettings({ settings: { rusn: rusnSettings } }, token);

    settingsLoadedRef.current = true;
    hasChangesRef.current = false;
    setHasChanges(false);
    setSelectedCategories(settings);
    setOriginalSettings(JSON.parse(JSON.stringify(settings)));
    invalidateRusnMaterialsCache();

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

    try {
      await persistRusnSettings(newCategories, { successMessage: 'Категория добавлена' });
    } catch {
      // persistRusnSettings уже показывает toast об ошибке
    }
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

    try {
      await persistRusnSettings(newCategories, { successMessage: 'Категория удалена' });
    } catch {
      // persistRusnSettings уже показывает toast об ошибке
    }
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

    try {
      await persistRusnSettings(newCategories, { silent: true });
    } catch {
      // persistRusnSettings уже показывает toast об ошибке
    }
  };

  const handleSave = async () => {
    if (!selectedCategories) return;

    try {
      await persistRusnSettings(selectedCategories);
    } catch (error) {
      console.error('Error saving settings:', error);
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
