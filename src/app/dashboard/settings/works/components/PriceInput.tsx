'use client';

import { digitsOnly, formatIntSpace } from '@/utils/formatIntSpace';

export { digitsOnly as priceInputDigitsOnly };

interface PriceInputProps {
  /** Строка из цифр (как в локальном состоянии), без пробелов. */
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  highlight?: boolean;
  suffix?: string | null;
}

export default function PriceInput({
  value,
  onChange,
  readOnly,
  highlight,
  suffix = 'тг',
}: PriceInputProps) {
  const display = formatIntSpace(value);

  return (
    <div className="flex items-center gap-1 shrink-0">
      <input
        type="text"
        inputMode="numeric"
        value={display}
        readOnly={readOnly}
        onChange={(e) => {
          onChange?.(digitsOnly(e.target.value));
        }}
        className={[
          'min-w-[6.5rem] w-[8.25rem] max-w-[10rem] border rounded-md px-2 py-1 text-sm font-semibold text-right tabular-nums',
          'focus:outline-none focus:ring-1 focus:ring-[#8eba1e]/50 focus:border-[#8eba1e]',
          'transition-colors duration-150',
          readOnly
            ? highlight
              ? 'bg-purple-50 border-purple-200/80 text-purple-700 cursor-default'
              : 'bg-gray-50 border-gray-100 text-gray-400 cursor-default'
            : 'bg-white border-gray-200 text-gray-900',
        ].join(' ')}
      />
      {suffix ? (
        <span className="text-xs font-medium text-gray-500 select-none shrink-0">{suffix}</span>
      ) : null}
    </div>
  );
}
