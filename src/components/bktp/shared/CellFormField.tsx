'use client';

import { ReactNode } from 'react';

const inputClassName =
  'w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors focus:border-[#8eba1e] focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25 disabled:bg-gray-50 disabled:text-gray-400';

type Props = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function CellFormField({ label, children, className = '' }: Props) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export { inputClassName };
