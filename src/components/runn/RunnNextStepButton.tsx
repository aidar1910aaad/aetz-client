'use client';

import React from 'react';
import Link from 'next/link';

interface RunnNextStepButtonProps {
  skip: boolean;
}

export const RunnNextStepButton: React.FC<RunnNextStepButtonProps> = ({ skip }) => {
  return (
    <Link href="/dashboard/bktp/work">
      <button className="bg-[#3A55DF] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
        {skip ? 'Пропустить РУНН' : 'К монтажным работам'}
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Link>
  );
};

