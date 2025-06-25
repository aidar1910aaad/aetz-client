import React from 'react';

interface TransformerFiltersProps<T> {
  label: string;
  items: T[];
  selected: T | null;
  onSelect: (value: T) => void;
  disabled?: boolean;
  disabledItems?: T[];
}

export function TransformerFilters<T extends string | number>({
  label,
  items,
  selected,
  onSelect,
  disabled,
  disabledItems = [],
}: TransformerFiltersProps<T>) {
  return (
    <div>
      <h3 className="font-medium mb-1">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isDisabled = disabled || disabledItems.includes(item);
          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              disabled={isDisabled}
              className={`px-4 py-2 rounded-full border font-medium text-sm transition-all duration-200
                ${
                  selected === item
                    ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
                    : isDisabled
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white hover:bg-[#E8F0FF] text-gray-800 border-gray-300'
                }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
