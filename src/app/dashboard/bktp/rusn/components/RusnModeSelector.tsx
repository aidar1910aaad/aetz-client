import React from 'react';

type RusnMode = 'configured' | 'not-configured';

interface RusnModeSelectorProps {
  mode: RusnMode;
  onModeChange: (mode: RusnMode) => void;
}

export default function RusnModeSelector({ mode, onModeChange }: RusnModeSelectorProps) {
  return (
    <div className="flex items-center gap-6">
      <span className="text-sm font-medium text-gray-700">Режим РУСН:</span>
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('configured')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            mode === 'configured'
              ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Настроить РУСН
          </span>
        </button>
        <button
          onClick={() => onModeChange('not-configured')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            mode === 'not-configured'
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Не предусмотрено
          </span>
        </button>
      </div>
    </div>
  );
}
