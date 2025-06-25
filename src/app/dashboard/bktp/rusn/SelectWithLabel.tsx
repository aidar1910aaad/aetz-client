'use client';

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export default function SelectWithLabel({ label, value, onChange, options }: Props) {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-800 truncate" title={label}>
          {label}
        </h4>
      </div>
      <div className="px-4 py-3">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
        >
          <option value="">Выберите</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 