import { getSettings } from '@/api/settings';
import { getAllCategories } from '@/api/categories';

export interface RusnSetting {
  type: 'switch' | 'rza' | 'counter' | 'sr' | 'tsn' | 'tn' | 'tt';
  isVisible: boolean;
  categoryId: number;
}

export interface RusnSettings {
  switch: { id: number; name: string }[];
  rza: { id: number; name: string }[];
  counter: { id: number; name: string }[];
  sr: { id: number; name: string }[];
  tsn: { id: number; name: string }[];
  tn: { id: number; name: string }[];
  tt: { id: number; name: string }[];
}

// Загрузка категорий
export const fetchCategories = async (token: string) => {
  try {
    return await getAllCategories(token);
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error);
    return [];
  }
};

// Загрузка настроек РУСН
export const fetchRusnSettings = async (
  token: string,
  allCategories: { id: number; name: string }[]
) => {
  try {
    const settings = await getSettings(token);

    if (!settings) return null;

    const visibleRusn = settings.settings.rusn?.filter((item) => item.isVisible) || [];

    // Группируем настройки по типам
    const settingsByType = visibleRusn.reduce((acc, setting) => {
      if (!acc[setting.type]) {
        acc[setting.type] = [];
      }
      acc[setting.type].push(setting);
      return acc;
    }, {} as Record<string, typeof visibleRusn>);

    // Преобразуем в нужный формат
    const rusnSettings: RusnSettings = {
      switch:
        settingsByType.switch?.map((item) => ({
          id: item.categoryId,
          name:
            allCategories.find((cat) => cat.id === item.categoryId)?.name ||
            `Категория ${item.categoryId}`,
        })) || [],
      rza:
        settingsByType.rza?.map((item) => ({
          id: item.categoryId,
          name:
            allCategories.find((cat) => cat.id === item.categoryId)?.name ||
            `Категория ${item.categoryId}`,
        })) || [],
      counter:
        settingsByType.counter?.map((item) => ({
          id: item.categoryId,
          name:
            allCategories.find((cat) => cat.id === item.categoryId)?.name ||
            `Категория ${item.categoryId}`,
        })) || [],
      sr:
        settingsByType.sr?.map((item) => ({
          id: item.categoryId,
          name:
            allCategories.find((cat) => cat.id === item.categoryId)?.name ||
            `Категория ${item.categoryId}`,
        })) || [],
      tsn:
        settingsByType.tsn?.map((item) => ({
          id: item.categoryId,
          name:
            allCategories.find((cat) => cat.id === item.categoryId)?.name ||
            `Категория ${item.categoryId}`,
        })) || [],
      tn:
        settingsByType.tn?.map((item) => ({
          id: item.categoryId,
          name:
            allCategories.find((cat) => cat.id === item.categoryId)?.name ||
            `Категория ${item.categoryId}`,
        })) || [],
      tt:
        settingsByType.tt?.map((item) => ({
          id: item.categoryId,
          name:
            allCategories.find((cat) => cat.id === item.categoryId)?.name ||
            `Категория ${item.categoryId}`,
        })) || [],
    };

    return rusnSettings;
  } catch (error) {
    console.error('Ошибка при загрузке настроек:', error);
    return null;
  }
};

// Получение названия напряжения
export const getVoltageLabel = (voltageType: number): string => {
  switch (voltageType) {
    case 400:
      return '0.4 кВ';
    case 10:
      return '10 кВ';
    case 20:
      return '20 кВ';
    default:
      return 'Не указано';
  }
};

// Получение стилей для напряжения
export const getVoltageStyles = (voltageType: number): string => {
  switch (voltageType) {
    case 400:
      return 'bg-green-100 text-green-700';
    case 10:
      return 'bg-blue-100 text-blue-700';
    case 20:
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};
