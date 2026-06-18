'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export type RunnTabType = 'main' | 'dgu';

interface RunnNextStepButtonProps {
  skip: boolean;
  activeTab?: RunnTabType;
  onSwitchToDgu?: () => void;
}

export const RunnNextStepButton: React.FC<RunnNextStepButtonProps> = ({
  skip,
  activeTab = 'main',
  onSwitchToDgu,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (skip) {
      router.push('/dashboard/bktp/additional-equipment');
      return;
    }
    if (activeTab === 'main') {
      onSwitchToDgu?.();
      return;
    }
    router.push('/dashboard/bktp/additional-equipment');
  };

  const label =
    skip || activeTab === 'dgu' ? 'Далее' : 'Добавить в спецификацию';

  return (
    <button 
      onClick={handleClick}
      className="flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 bg-[#8eba1e] hover:bg-[#7aa31a] text-white shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {label}
    </button>
  );
};

