'use client';

export function BmzOptions({
  lighting,
  heatedFloor,
  heating,
  fireAlarm,
  cableTrays,
  conditioning,
  ventilationShaft,
  isDisabled,
  setField,
}: {
  lighting: boolean;
  heatedFloor: boolean;
  heating: boolean;
  fireAlarm: boolean;
  cableTrays: boolean;
  conditioning: boolean;
  ventilationShaft: boolean;
  isDisabled: boolean;
  setField: (field: string, value: any) => void;
}) {
  const options = [
    { label: 'Освещение', field: 'lighting' },
    { label: 'Отопление', field: 'heating' },
    { label: 'Пожарная сигнализация', field: 'fireAlarm' },
    { label: 'Утеплённый пол', field: 'heatedFloor' },
    { label: 'Кабельные полки и стойки', field: 'cableTrays' },
    { label: 'Шахта вентиляции', field: 'ventilationShaft' },
  ];

  const state = {
    lighting,
    heatedFloor,
    heating,
    fireAlarm,
    cableTrays,
    conditioning,
    ventilationShaft,
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Дополнительные опции</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(({ label, field }) => (
          <label
            key={field}
            className={`flex items-center gap-3 text-sm cursor-pointer ${
              isDisabled ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={state[field as keyof typeof state]}
              onChange={(e) => setField(field, e.target.checked)}
              disabled={isDisabled}
              className="h-4 w-4 text-[#3A55DF] border-gray-300 rounded focus:ring-[#3A55DF]"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
