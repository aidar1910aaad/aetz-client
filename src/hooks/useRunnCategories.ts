import { useEffect, useState } from 'react';
import {
  EMPTY_RUNN_CATEGORIES,
  loadRunnCategories,
  RunnCategoriesByType,
} from '@/domain/runn/runnCategoriesLoader';

/** Только чтение категорий РУНН для конфигуратора БКТП (без записи в API). */
export function useRunnCategories() {
  const [selectedCategories, setSelectedCategories] = useState<RunnCategoriesByType | null>(null);
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

        const categories = await loadRunnCategories(token);
        if (!cancelled) {
          setSelectedCategories(categories);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Ошибка загрузки категорий РУНН:', err);
          setError(err instanceof Error ? err.message : 'Ошибка загрузки категорий');
          setSelectedCategories(EMPTY_RUNN_CATEGORIES);
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

  return { selectedCategories, loading, error };
}
