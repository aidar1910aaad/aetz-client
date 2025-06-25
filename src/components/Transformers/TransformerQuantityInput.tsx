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
      <label className="font-medium text-sm">Количество трансформаторов</label>
      <input
        type="number"
        min={1}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        className="w-24 border px-3 py-1 rounded"
      />
    </div>
  );
}
