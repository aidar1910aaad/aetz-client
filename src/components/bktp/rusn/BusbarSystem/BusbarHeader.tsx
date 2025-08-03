import React from 'react';

interface BusbarHeaderProps {
  matchingConfigId?: string;
}

export const BusbarHeader: React.FC<BusbarHeaderProps> = ({ matchingConfigId }) => {
  return (
    <div className="bg-gray-50 border-b border-gray-300 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Сборные шины</h3>
            <p className="text-sm text-gray-600">Автоматический расчет на основе конфигурации</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">ID: {matchingConfigId || 'N/A'}</div>
      </div>
    </div>
  );
};
