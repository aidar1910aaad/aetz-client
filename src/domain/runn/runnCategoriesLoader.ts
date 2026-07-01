import { getAllCategories, Category } from '@/api/categories';
import { getSettings } from '@/api/settings/index';

export interface RunnCategorySetting {
  id: string;
  name: string;
  visible: boolean;
}

export interface RunnCategoriesByType {
  avtomatVyk: RunnCategorySetting[];
  avtomatLity: RunnCategorySetting[];
  counter: RunnCategorySetting[];
  rpsLeft: RunnCategorySetting[];
  fusesPn: RunnCategorySetting[];
  currentTransformer: RunnCategorySetting[];
  moldedCaseSwitch: RunnCategorySetting[];
}

export const EMPTY_RUNN_CATEGORIES: RunnCategoriesByType = {
  avtomatVyk: [],
  avtomatLity: [],
  counter: [],
  rpsLeft: [],
  fusesPn: [],
  currentTransformer: [],
  moldedCaseSwitch: [],
};

type ApiRunnSetting = {
  categoryId: number;
  type: string;
  isVisible: boolean;
};

const categoriesCache: {
  data: RunnCategoriesByType | null;
  promise: Promise<RunnCategoriesByType> | null;
} = { data: null, promise: null };

export function transformRunnSettings(
  apiRunnSettings: ApiRunnSetting[],
  allCategories: Category[]
): RunnCategoriesByType {
  const transformed: RunnCategoriesByType = {
    avtomatVyk: [],
    avtomatLity: [],
    counter: [],
    rpsLeft: [],
    fusesPn: [],
    currentTransformer: [],
    moldedCaseSwitch: [],
  };

  apiRunnSettings.forEach((setting) => {
    const categoryId = Number(setting.categoryId);
    const category = allCategories.find((cat) => cat.id === categoryId);
    const categoryName = category?.name || `Категория ${categoryId}`;

    const categorySetting: RunnCategorySetting = {
      id: String(categoryId),
      name: categoryName,
      visible: setting.isVisible ?? true,
    };

    switch (setting.type) {
      case 'avtomatVyk':
        transformed.avtomatVyk.push(categorySetting);
        break;
      case 'avtomatLity':
        transformed.avtomatLity.push(categorySetting);
        break;
      case 'counter':
        transformed.counter.push(categorySetting);
        break;
      case 'rpsLeft':
        transformed.rpsLeft.push(categorySetting);
        break;
      case 'fusesPn':
        transformed.fusesPn.push(categorySetting);
        break;
      case 'currentTransformer':
        transformed.currentTransformer.push(categorySetting);
        break;
      case 'moldedCaseSwitch':
        transformed.moldedCaseSwitch.push(categorySetting);
        break;
      default:
        console.warn('Неизвестный тип настройки РУНН:', setting.type);
    }
  });

  return transformed;
}

export async function loadRunnCategories(token: string): Promise<RunnCategoriesByType> {
  if (categoriesCache.data) {
    return categoriesCache.data;
  }

  if (!categoriesCache.promise) {
    categoriesCache.promise = (async () => {
      const [settingsResponse, allCategories] = await Promise.all([
        getSettings(token),
        getAllCategories(token),
      ]);

      const runnSettings = (settingsResponse.settings?.runn ?? []) as ApiRunnSetting[];
      const transformed = transformRunnSettings(runnSettings, allCategories);
      categoriesCache.data = transformed;
      return transformed;
    })();
  }

  try {
    return await categoriesCache.promise;
  } finally {
    categoriesCache.promise = null;
  }
}

export function invalidateRunnCategoriesCache(): void {
  categoriesCache.data = null;
  categoriesCache.promise = null;
}
