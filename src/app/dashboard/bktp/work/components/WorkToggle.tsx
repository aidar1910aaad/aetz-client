'use client';

import { useState } from 'react';

interface WorkToggleProps {
  onToggle: (isEnabled: boolean) => void;
}

export default function WorkToggle({ onToggle }: WorkToggleProps) {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = (value: boolean) => {
    setIsEnabled(value);
    onToggle(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Включить работы
          </h3>
          <p className="text-sm text-gray-600">
            Выберите "Да" для добавления работ в спецификацию
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleToggle(false)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !isEnabled
                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
            }`}
          >
            Нет
          </button>
          
          <button
            onClick={() => handleToggle(true)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isEnabled
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
            }`}
          >
            Да
          </button>
        </div>
      </div>
    </div>
  );
} 