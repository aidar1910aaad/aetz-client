import { Material } from '@/api/material';

type Props = {
  materials: Material[];
  searchQuery: string;
  onAdd: (m: Material) => void;
  onSearch: (value: string) => void;
};

export default function MaterialSearchList({ materials, searchQuery, onAdd, onSearch }: Props) {
  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Поиск материалов..."
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="border rounded px-3 py-2 flex justify-between items-center text-sm"
          >
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-gray-500 text-xs">
                {m.unit}, {m.price.toLocaleString()} тг
              </div>
            </div>
            <button
              onClick={() => onAdd(m)}
              className="text-[#3A55DF] text-sm hover:underline"
            >
              Добавить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
