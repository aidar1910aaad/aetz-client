'use client';

import { useState, ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
  defaultEnabled?: boolean;
};

export default function TogglerWithInput({ label, children, defaultEnabled = true }: Props) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label className="font-medium">{label}</label>
        <button
          onClick={() => setEnabled((prev) => !prev)}
          className="text-sm text-gray-600 hover:underline"
        >
          {enabled ? 'Нет' : 'Добавить'}
        </button>
      </div>

      {enabled && <div>{children}</div>}
    </div>
  );
}
