'use client';

import { useWorkVisibilityStore } from '@/store/useWorkVisibilityStore';

interface WorkToggleProps {
  onToggle: (isEnabled: boolean) => void;
}

export default function WorkToggle({ onToggle }: WorkToggleProps) {
  const { isWorksEnabled, setWorksEnabled } = useWorkVisibilityStore();

  const handleToggle = (value: boolean) => {
    setWorksEnabled(value);
    onToggle(value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Включить работы
            </h3>
            <p className="text-sm text-gray-600">
              Выберите "Да" для добавления работ в спецификацию
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleToggle(false)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              !isWorksEnabled
                ? 'bg-red-100 text-red-700 border-2 border-red-300 shadow-lg'
                : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Нет
          </button>
          
          <button
            onClick={() => handleToggle(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isWorksEnabled
                ? 'bg-[#8eba1e] text-white border-2 border-[#8eba1e] shadow-lg'
                : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-[#8eba1e]/10 hover:border-[#8eba1e]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Да
          </button>
        </div>
      </div>
    </div>
  );
} 