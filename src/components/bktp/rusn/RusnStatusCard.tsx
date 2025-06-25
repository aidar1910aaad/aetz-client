'use client';

import React from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { useCalculationGroups } from '@/hooks/useCalculationGroups';

interface RusnStatusCardProps {
  voltage: string;
}

export const RusnStatusCard: React.FC<RusnStatusCardProps> = ({ voltage }) => {
  const { cellConfigs, global } = useRusnStore();
  const { groups } = useCalculationGroups();

  const hasConfiguration = cellConfigs.length > 0;
  const hasGlobalSettings = global.breaker || global.rza || global.meterType;

  const getStatusColor = () => {
    if (hasConfiguration && hasGlobalSettings) return 'green';
    if (hasConfiguration || hasGlobalSettings) return 'yellow';
    return 'gray';
  };

  const getStatusText = () => {
    if (hasConfiguration && hasGlobalSettings) {
      return 'Полностью настроен';
    }
    if (hasConfiguration) {
      return 'Частично настроен (ячейки)';
    }
    if (hasGlobalSettings) {
      return 'Частично настроен (общие настройки)';
    }
    return 'Не настроен';
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    const iconClass = `w-5 h-5 text-${color}-600`;

    switch (color) {
      case 'green':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'yellow':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getStatusBgColor = () => {
    const color = getStatusColor();
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusTextColor = () => {
    const color = getStatusColor();
    switch (color) {
      case 'green':
        return 'text-green-900';
      case 'yellow':
        return 'text-yellow-900';
      default:
        return 'text-gray-900';
    }
  };

  const getStatusDescriptionColor = () => {
    const color = getStatusColor();
    switch (color) {
      case 'green':
        return 'text-green-700';
      case 'yellow':
        return 'text-yellow-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusBgColor()}`}>
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${getStatusTextColor()}`}>
            РУСН-{voltage}кВ: {getStatusText()}
          </h3>
          <div className={`text-sm ${getStatusDescriptionColor()} mt-1`}>
            <div className="flex items-center gap-4">
              <span>Ячеек: {cellConfigs.length}</span>
              <span>•</span>
              <span>Доступно типов: {groups.length}</span>
              {hasGlobalSettings && (
                <>
                  <span>•</span>
                  <span>Общие настройки: ✓</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
