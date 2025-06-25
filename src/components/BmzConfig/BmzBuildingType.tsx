'use client';

import React from 'react';

interface BmzBuildingTypeProps {
  onChange: (type: 'bmz' | 'tp' | 'none') => void;
  selectedType?: 'bmz' | 'tp' | 'none';
}

const BmzBuildingType: React.FC<BmzBuildingTypeProps> = ({ onChange, selectedType }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Тип здания</h3>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onChange('bmz')}
          className={`flex items-center justify-center p-4 border rounded-lg transition-colors ${
            selectedType === 'bmz'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'hover:bg-gray-50 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span className="text-lg font-medium">БМЗ</span>
        </button>

        <button
          onClick={() => onChange('tp')}
          className={`flex items-center justify-center p-4 border rounded-lg transition-colors ${
            selectedType === 'tp'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'hover:bg-gray-50 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span className="text-lg font-medium">ТП</span>
        </button>

        <button
          onClick={() => onChange('none')}
          className={`flex items-center justify-center p-4 border rounded-lg transition-colors ${
            selectedType === 'none'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'hover:bg-gray-50 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span className="text-lg font-medium">Нет</span>
        </button>
      </div>
    </div>
  );
};

export default BmzBuildingType;
