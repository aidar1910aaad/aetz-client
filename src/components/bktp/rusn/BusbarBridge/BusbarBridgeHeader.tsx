import React from 'react';

interface BusbarBridgeHeaderProps {
  matchingConfigId?: string;
}

export const BusbarBridgeHeader: React.FC<BusbarBridgeHeaderProps> = ({ matchingConfigId }) => {
  return (
    <div className="bg-gray-50 border-b border-gray-300 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Шинный мост</h3>
            <p className="text-sm text-gray-600">Расчет по длине и конфигурации</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">ID: {matchingConfigId || 'N/A'}</div>
      </div>
    </div>
  );
}; 