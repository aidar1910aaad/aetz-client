'use client';

type BuildingType = 'bmz' | 'tp' | 'none';

export function BmzBuildingType({
  buildingType,
  onChange,
}: {
  buildingType: BuildingType;
  onChange: (value: BuildingType) => void;
}) {
  const options: { value: BuildingType; label: string }[] = [
    { value: 'bmz', label: 'БМЗ' },
    { value: 'tp', label: 'ТП' },
    { value: 'none', label: 'Нет' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm space-y-4">
      <p className="text-sm font-semibold text-gray-700">Здание</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {options.map(({ value, label }) => {
          const isActive = buildingType === value;
          return (
            <label
              key={value}
              className={`cursor-pointer px-4 py-2 rounded border text-sm font-medium transition-all
                ${
                  isActive
                    ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
            >
              <input
                type="radio"
                name="buildingType"
                value={value}
                checked={isActive}
                onChange={() => onChange(value)}
                className="hidden"
              />
              {label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
