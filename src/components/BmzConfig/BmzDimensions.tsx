'use client';

export function BmzDimensions({
  width,
  length,
  height,
  thickness,
  blockCount,
  isDisabled,
  setField,
}: {
  width: number;
  length: number;
  height: number;
  thickness: number | null;
  blockCount: number;
  isDisabled: boolean;
  setField: (field: string, value: any) => void;
}) {
  const inputClass =
    'w-44 border rounded px-3 py-2 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3A55DF]';
  const labelClass = 'w-44 text-sm font-semibold text-gray-700';

  return (
    <div className="bg-white shadow-md rounded-md p-6 mt-6 space-y-5 border border-gray-200">
      <h2 className="text-lg font-bold text-[#3A55DF] mb-2">Габаритные размеры и блоки</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className={labelClass}>Ширина (мм):</label>
          <input
            type="number"
            value={width === 0 ? '' : width}
            placeholder="0"
            disabled={isDisabled}
            onChange={(e) => setField('width', e.target.value === '' ? 0 : Number(e.target.value))}
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClass}>Длина (мм):</label>
          <input
            type="number"
            value={length === 0 ? '' : length}
            placeholder="0"
            disabled={isDisabled}
            onChange={(e) => setField('length', e.target.value === '' ? 0 : Number(e.target.value))}
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClass}>Высота (мм):</label>
          <input
            type="number"
            value={height === 0 ? '' : height}
            placeholder="0"
            disabled={isDisabled}
            onChange={(e) => setField('height', e.target.value === '' ? 0 : Number(e.target.value))}
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClass}>Толщина (мм):</label>
          <select
            value={thickness ?? ''}
            disabled={isDisabled}
            onChange={(e) =>
              setField(
                'thickness',
                e.target.value === '50' ? 50 : e.target.value === '100' ? 100 : null
              )
            }
            className={inputClass}
          >
            <option value="">Выберите</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClass}>Количество блоков:</label>
          <input
            type="number"
            value={blockCount || ''}
            placeholder="0"
            disabled={isDisabled}
            onChange={(e) => setField('blockCount', Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
