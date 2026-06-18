import React from 'react';
import { BusSectionHeader } from '@/components/shared/busUi';

interface BusbarHeaderProps {
  matchingConfigId?: string;
}

export const BusbarHeader: React.FC<BusbarHeaderProps> = ({ matchingConfigId }) => {
  return (
    <BusSectionHeader
      title="Сборные шины"
      subtitle="Автоматический расчёт по выбранному выключателю и материалу"
      badge={matchingConfigId ? `Конфиг. ${matchingConfigId}` : 'Конфиг. не выбрана'}
    />
  );
};
