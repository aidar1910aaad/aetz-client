import { getAllCategories, Category } from '@/api/categories';
import { getSettings } from '@/api/settings/index';
import type { RusnSettings } from '@/utils/rusnSettings';

type ApiRusnSetting = {
  categoryId: number;
  type: string;
  isVisible: boolean;
};

const EMPTY_RUSN_CATEGORIES: RusnSettings = {
  switch: [],
  rza: [],
  counter: [],
  sr: [],
  tsn: [],
  tn: [],
  tt: [],
};

const categoriesCache: {
  data: RusnSettings | null;
  promise: Promise<RusnSettings> | null;
} = { data: null, promise: null };

function transformVisibleRusnSettings(
  apiRusnSettings: ApiRusnSetting[],
  allCategories: Category[]
): RusnSettings {
  const visible = apiRusnSettings.filter((item) => item.isVisible);

  const settingsByType = visible.reduce<Record<string, ApiRusnSetting[]>>((acc, setting) => {
    if (!acc[setting.type]) {
      acc[setting.type] = [];
    }
    acc[setting.type].push(setting);
    return acc;
  }, {});

  const mapType = (type: keyof RusnSettings) =>
    settingsByType[type]?.map((item) => ({
      id: item.categoryId,
      name:
        allCategories.find((cat) => cat.id === item.categoryId)?.name ||
        `Категория ${item.categoryId}`,
    })) || [];

  return {
    switch: mapType('switch'),
    rza: mapType('rza'),
    counter: mapType('counter'),
    sr: mapType('sr'),
    tsn: mapType('tsn'),
    tn: mapType('tn'),
    tt: mapType('tt'),
  };
}

export async function loadRusnCategories(token: string): Promise<RusnSettings> {
  if (categoriesCache.data) {
    return categoriesCache.data;
  }

  if (!categoriesCache.promise) {
    categoriesCache.promise = (async () => {
      const [settingsResponse, allCategories] = await Promise.all([
        getSettings(token),
        getAllCategories(token),
      ]);

      const rusnSettings = (settingsResponse.settings?.rusn ?? []) as ApiRusnSetting[];
      const transformed = transformVisibleRusnSettings(rusnSettings, allCategories);
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

export function invalidateRusnCategoriesCache(): void {
  categoriesCache.data = null;
  categoriesCache.promise = null;
}

export { EMPTY_RUSN_CATEGORIES };
