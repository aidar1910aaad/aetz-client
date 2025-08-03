import React from 'react';

interface BreakerInfoProps {
  selectedBreaker?: {
    name: string;
  };
  getBreakerCurrent: (name: string) => number | null;
}

export const BreakerInfo: React.FC<BreakerInfoProps> = ({ selectedBreaker, getBreakerCurrent }) => {
  if (!selectedBreaker) return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
        <span className="text-sm font-medium text-gray-700">Выбранный выключатель:</span>
        <span className="font-semibold text-purple-900">
          {selectedBreaker.name} ({getBreakerCurrent(selectedBreaker.name)}А)
        </span>
      </div>
    </div>
  );
};
