import React from 'react';

interface BreakerInfoProps {
  selectedBreaker?: string;
  getBreakerCurrent: (name: string) => number | null;
}

export const BreakerInfo: React.FC<BreakerInfoProps> = ({ 
  selectedBreaker, 
  getBreakerCurrent 
}) => {
  if (!selectedBreaker) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-yellow-800">
          Добавьте ячейку "Шинный мост" для расчета шинного моста
        </p>
      </div>
    );
  }

  const current = getBreakerCurrent(selectedBreaker);

  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded">
      <h4 className="font-medium text-blue-900 mb-2">Информация о шинном мосте</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Выключатель:</span>
          <span className="ml-2 font-medium">{selectedBreaker}</span>
        </div>
        {current && (
          <div>
            <span className="text-gray-600">Ток:</span>
            <span className="ml-2 font-medium">{current} А</span>
          </div>
        )}
      </div>
    </div>
  );
};

