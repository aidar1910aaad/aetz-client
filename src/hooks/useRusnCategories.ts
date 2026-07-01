import { useEffect, useState } from 'react';
import type { RusnSettings } from '@/utils/rusnSettings';
import {
  EMPTY_RUSN_CATEGORIES,
  loadRusnCategories,
} from '@/domain/rusn/rusnCategoriesLoader';

/** Только чтение категорий РУСН для конфигуратора БКТП (без записи в API). */
export function useRusnCategories() {
  const [rusnSettings, setRusnSettings] = useState<RusnSettings>(EMPTY_RUSN_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен не найден');
        }

        const categories = await loadRusnCategories(token);
        if (!cancelled) {
          setRusnSettings(categories);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Ошибка загрузки категорий РУСН:', err);
          setError(err instanceof Error ? err.message : 'Ошибка загрузки категорий');
          setRusnSettings(EMPTY_RUSN_CATEGORIES);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rusnSettings, loading, error };
}
