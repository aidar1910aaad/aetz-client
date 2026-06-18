import React from 'react';
import { BusSectionHeader } from '@/components/shared/busUi';

interface BusbarBridgeHeaderProps {
  matchingConfigId?: string;
}

export const BusbarBridgeHeader: React.FC<BusbarBridgeHeaderProps> = ({ matchingConfigId }) => {
  return (
    <BusSectionHeader
      title="Шинные мосты"
      subtitle="Расчёт по длине и конфигурации коммутационного аппарата"
      badge={matchingConfigId ? `Конфиг. ${matchingConfigId}` : 'Конфиг. не выбрана'}
      icon={
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      }
    />
  );
};
