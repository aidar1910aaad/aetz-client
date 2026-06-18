'use client';

import { useEffect, useState } from 'react';
import { Bug } from 'lucide-react';

const STORAGE_KEY = 'debug-panels-enabled';

export function useDebugPanelsEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return { enabled, toggle };
}

export default function DebugToggle() {
  const { enabled, toggle } = useDebugPanelsEnabled();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
        enabled
          ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
          : 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Bug className="h-4 w-4" />
      {enabled ? 'Отключить отладку' : 'Включить отладку'}
    </button>
  );
}
