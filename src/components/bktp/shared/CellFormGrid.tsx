'use client';

import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

export default function CellFormGrid({ children, footer }: Props) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/40 overflow-visible">
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
          {footer}
        </div>
      )}
    </div>
  );
}
