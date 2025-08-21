import React from 'react';

interface BusbarHeaderProps {
  matchingConfigId?: string;
}

export const BusbarHeader: React.FC<BusbarHeaderProps> = ({ matchingConfigId }) => {
  return (
    <div className="bg-gray-100 px-6 py-4 border-b border-gray-300">
      <h3 className="text-lg font-semibold text-gray-800">
        Сборные шины РУНН
        {matchingConfigId && (
          <span className="ml-2 text-sm text-gray-600">
            (Конфигурация: {matchingConfigId})
          </span>
        )}
      </h3>
    </div>
  );
};

