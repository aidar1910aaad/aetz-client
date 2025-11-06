'use client';

import { useEffect } from 'react';
import { useWorkVisibilityStore } from '@/store/useWorkVisibilityStore';
import { useWorksStore } from '@/store/useWorksStore';

interface WorkVisibilityManagerProps {
  children: React.ReactNode;
}

/**
 * Компонент для управления видимостью страницы работ
 * Скрывает/показывает страницу работ в зависимости от состояния
 */
export default function WorkVisibilityManager({ children }: WorkVisibilityManagerProps) {
  const { isPageVisible } = useWorkVisibilityStore();
  const { isEnabled } = useWorksStore();

  // Синхронизируем состояние между сторами
  useEffect(() => {
    // Если работы отключены, скрываем страницу
    if (!isEnabled) {
      useWorkVisibilityStore.getState().setPageVisible(false);
    }
  }, [isEnabled]);

  // Если страница не видна, не рендерим содержимое
  if (!isPageVisible) {
    return null;
  }

  return <>{children}</>;
}