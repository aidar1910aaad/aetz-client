'use client';

import { useState, useEffect } from 'react';

interface WorkTypeToggleProps {
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  icon?: React.ReactNode;
}

export default function WorkTypeToggle({ 
  title, 
  description, 
  isEnabled, 
  onToggle, 
  icon 
}: WorkTypeToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Возвращаем базовую структуру без динамических классов для предотвращения ошибок гидратации
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              {icon || (
                <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                {description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onToggle(false)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 text-gray-600 border-2 border-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Нет
            </button>
            
            <button
              onClick={() => onToggle(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 text-gray-600 border-2 border-gray-300"
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
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            {icon || (
              <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onToggle(false)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              !isEnabled
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
            onClick={() => onToggle(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isEnabled
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
