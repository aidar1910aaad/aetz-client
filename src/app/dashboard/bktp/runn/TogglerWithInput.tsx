'use client';

import { useState, ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
  defaultEnabled?: boolean;
  toggled?: boolean;
  onToggle?: () => void;
};

export default function TogglerWithInput({
  label,
  children,
  defaultEnabled = false,
  toggled,
  onToggle,
}: Props) {
  const [internalEnabled, setInternalEnabled] = useState(defaultEnabled);
  const isControlled = toggled !== undefined;
  const isEnabled = isControlled ? toggled : internalEnabled;

  const handleClick = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalEnabled((prev) => !prev);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-800 truncate" title={label}>
          {label}
        </h4>
        <button
          onClick={handleClick}
          className={`text-xs font-medium px-3 py-1 rounded transition duration-150 ${
            isEnabled
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {isEnabled ? 'Нет' : 'Добавить'}
        </button>
      </div>
      {isEnabled && <div className="px-4 py-3 space-y-2">{children}</div>}
    </div>
  );
}
