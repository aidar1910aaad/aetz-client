'use client';

import { useState, ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
  defaultEnabled?: boolean;
  toggled?: boolean;
  onToggle?: () => void;
  hideToggle?: boolean;
};

export default function CellSectionToggler({
  label,
  children,
  defaultEnabled = false,
  toggled,
  onToggle,
  hideToggle = false,
}: Props) {
  const [internalEnabled, setInternalEnabled] = useState(defaultEnabled);
  const isControlled = toggled !== undefined;
  const isEnabled = hideToggle ? true : isControlled ? toggled : internalEnabled;

  const handleClick = () => {
    if (hideToggle) return;
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalEnabled((prev) => !prev);
    }
  };

  return (
    <div className="rounded-xl border border-[#8eba1e]/25 bg-white shadow-sm overflow-visible">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#8eba1e]/8 to-white border-b border-[#8eba1e]/15">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
              isEnabled ? 'bg-[#8eba1e] text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isEnabled ? '✓' : '+'}
          </span>
          <h4 className="text-sm font-semibold text-gray-900 truncate" title={label}>
            {label}
          </h4>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            isEnabled
              ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
              : 'text-[#5a7a12] bg-[#8eba1e]/15 hover:bg-[#8eba1e]/25 border border-[#8eba1e]/30'
          } ${hideToggle ? 'hidden' : ''}`}
        >
          {isEnabled ? 'Скрыть' : 'Добавить'}
        </button>
      </div>
      {isEnabled && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}
