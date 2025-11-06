import React from 'react';

interface BreakerInfoProps {
  selectedBreaker?: string;
  getBreakerCurrent: (name: string) => number | null;
  transformerPower?: number;
}

export const BreakerInfo: React.FC<BreakerInfoProps> = ({ 
  selectedBreaker, 
  getBreakerCurrent,
  transformerPower
}) => {
  if (!selectedBreaker) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-yellow-800">
          Выберите трансформатор для расчета сборных шин
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded">
      <h4 className="font-medium text-blue-900 mb-2">Информация о трансформаторе</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Трансформатор:</span>
          <span className="ml-2 font-medium">{selectedBreaker}</span>
        </div>
        {transformerPower && (
          <div>
            <span className="text-gray-600">Мощность:</span>
            <span className="ml-2 font-medium">{transformerPower} кВА</span>
          </div>
        )}
      </div>
    </div>
  );
};

