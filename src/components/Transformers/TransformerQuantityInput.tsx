import React from 'react';

interface TransformerQuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function TransformerQuantityInput({
  value,
  onChange,
  disabled,
}: TransformerQuantityInputProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="font-medium text-sm text-gray-700">Количество трансформаторов</label>
      <input
        type="number"
        min={1}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        className={`w-24 border-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          disabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e] hover:border-[#8eba1e]'
        }`}
      />
    </div>
  );
}
